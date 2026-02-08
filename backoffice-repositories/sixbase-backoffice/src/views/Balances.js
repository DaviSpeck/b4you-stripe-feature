import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Badge, Button, Input, Row, Col } from 'reactstrap';
import memoizeOne from 'memoize-one';
import DataTable from 'react-data-table-component';
import { useSkin } from '../utility/hooks/useSkin';
import { Link } from 'react-router-dom';
import { FormatBRL } from '../utility/Utils';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, Search, Download } from 'react-feather';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';

const configNotify = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

const columns = memoizeOne(() => [
  {
    name: 'Nome',
    cell: (row) => <Link to={`/producer/${row.uuid}`}>{row.full_name}</Link>,
  },
  {
    name: 'Email',
    cell: (row) => row.email,
  },
  {
    name: 'Total a repassar',
    cell: (row) => (
      <Badge style={{ fontSize: 14 }}>{FormatBRL(row.balance)}</Badge>
    ),
  },
  {
    name: 'Total a liberar',
    cell: (row) => (
      <Badge style={{ fontSize: 14 }}>{FormatBRL(row.pending)}</Badge>
    ),
  },
  {
    name: 'Total a repassar + Total a liberar',
    cell: (row) => (
      <Badge color="primary" style={{ fontSize: 14 }}>
        {FormatBRL(row.balance + row.pending)}
      </Badge>
    ),
  },
  {
    name: 'Saldo Pagarme Pendente',
    cell: (row) => (
      <Badge color="secondary" style={{ fontSize: 14 }}>
        {FormatBRL(row.pagarme_balance_pending / 100)}
      </Badge>
    ),
  },
  {
    name: 'Saldo Pagarme Liberado',
    cell: (row) => (
      <Badge color="secondary" style={{ fontSize: 14 }}>
        {FormatBRL(row.pagarme_balance_available / 100)}
      </Badge>
    ),
  },
]);

const balancesCache = new Map();
const CACHE_TTL = 2 * 60 * 1000;

const Balances = () => {
  const { skin } = useSkin();
  const [records, setRecords] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [recordsCount, setRecordsCount] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState([
    moment().startOf('month').toDate(),
    moment().toDate(),
  ]);

  const fetchData = useCallback(
    async (page = 0, newPerPage = null, search = '') => {
      const perPage = newPerPage ? newPerPage : recordsPerPage;
      const cacheKey = `balances_${page}_${perPage}_${search}_${moment(
        dateFilter[0],
      ).format('YYYY-MM-DD')}_${moment(dateFilter[1]).format('YYYY-MM-DD')}`;

      const cached = balancesCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setRecords(cached.data.rows);
        setRecordsCount(cached.data.count);
        return;
      }

      setLoading(true);
      try {
        const query = new URLSearchParams();
        query.append('page', page);
        query.append('size', perPage);
        if (search) {
          query.append('search', search);
        }
        const response = await api.get(`users/balances?${query.toString()}`);

        balancesCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
        });

        setRecords(response.data.rows);
        setRecordsCount(response.data.count);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    },
    [recordsPerPage, dateFilter],
  );

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  useEffect(() => {
    fetchData(0, null, debouncedSearchTerm);
  }, [debouncedSearchTerm, dateFilter, fetchData]);

  const handleRecordsPerPageChange = useCallback(
    async (newPerPage, page) => {
      await fetchData(page - 1, newPerPage, debouncedSearchTerm);
      setRecordsPerPage(newPerPage);
    },
    [fetchData, debouncedSearchTerm],
  );

  const handleRecordsPageChange = useCallback(
    (page) => {
      fetchData(page - 1, null, debouncedSearchTerm);
    },
    [fetchData, debouncedSearchTerm],
  );

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const submitExport = useCallback(() => {
    toast.success('Exportando... Essa operação pode demorar', configNotify);
    setRequesting(true);

    api
      .get(`users/balances/export`, {
        responseType: 'blob',
      })
      .then((r) => {
        const url = window.URL.createObjectURL(new Blob([r.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `saldo_usuarios_${moment().format('YYYY-MM-DD')}.xlsx`,
        );
        document.body.appendChild(link);
        link.click();
        toast.success('Exportado com sucesso', configNotify);
      })
      .catch((e) => console.error(e))
      .finally(() => setRequesting(false));
  }, [debouncedSearchTerm, dateFilter]);

  return (
    <div>
      <Row className="mb-2 mt-2">
        <div className="d-flex justify-content-between w-full">
          <Col md="4">
            <div className="d-flex align-items-center">
              <Search size={16} className="me-2" />
              <Input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </Col>
          <Col md="4" className="d-flex justify-content-end">
            <Button
              color="primary"
              onClick={submitExport}
              className="d-inline-flex align-items-center"
            >
              {requesting ? <LoadingSpinner /> : <Download size={16} />}
              <span className="ms-2">
                {requesting ? 'Exportando...' : 'Exportar Excel'}
              </span>
            </Button>
          </Col>
        </div>
      </Row>
      <div>
        <DataTable
          columns={columns()}
          data={records}
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={recordsCount}
          onChangeRowsPerPage={handleRecordsPerPageChange}
          onChangePage={handleRecordsPageChange}
          paginationComponentOptions={{
            rowsPerPageText: 'Linhas por página:',
            rangeSeparatorText: 'de',
            noRowsPerPage: false,
          }}
          progressComponent={<LoadingSpinner text="Carregando..." showText />}
          noDataComponent={<>Não há resultado</>}
          theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
        />
      </div>
    </div>
  );
};

export default Balances;
