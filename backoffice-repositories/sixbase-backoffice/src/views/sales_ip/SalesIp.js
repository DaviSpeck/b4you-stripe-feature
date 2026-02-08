import moment from 'moment';
import { useState, useEffect } from 'react';
import { api } from '@services/api';
import {
  Badge,
  Card,
  CardBody,
  Col,
  Input,
  Label,
  Row,
  Spinner,
} from 'reactstrap';

import '@styles/react/libs/flatpickr/flatpickr.scss';
import '@styles/react/libs/charts/recharts.scss';
import DataTable from 'react-data-table-component';
import memoizeOne from 'memoize-one';
import { Link } from 'react-router-dom';
import { FormatBRL, formatDocument, capitalizeName } from '@utils';
import { useSkin } from '../../utility/hooks/useSkin';

const columns = memoizeOne(() => [
  {
    name: 'Data',
    cell: (row) =>
      moment(row?.items[0].created_at).format('DD/MM/YYYY HH:mm:ss'),
    width: '110px',
  },
  {
    name: 'Produto',
    cell: (row) => (
      <Link
        to={`/producer/${row?.items[0].product?.producer?.uuid}/product/${row?.items[0].product?.uuid}`}
      >
        {row?.items[0].product?.name}
      </Link>
    ),
    minWidth: '190px',
  },
  {
    name: 'Cliente',
    cell: (row) => {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Link to={`/student/${row?.items[0].student?.uuid}`}>
            {capitalizeName(row?.items[0].student?.full_name)}
          </Link>
          <span>{row.items[0].student.email}</span>
          <span>{`CPF: ${formatDocument(
            row.items[0].student.document_number,
            'CPF',
          )}`}</span>
        </div>
      );
    },
    minWidth: '220px',
  },
  { name: 'IP', cell: (row) => row?.params?.ip || '-' },
  {
    name: 'Valor',
    cell: (row) => FormatBRL(row?.items[0].price),
    width: '110px',
  },
  {
    name: 'Metodo',
    width: '90px',
    cell: (row) =>
      row.items[0].payment_method === 'card'
        ? 'Cartão'
        : row.items[0].payment_method === 'pix'
        ? 'Pix'
        : 'Boleto',
  },
  {
    name: 'Status',
    cell: (row) => (
      <Badge color={row?.items[0].status?.color}>
        {row.items[0].status.name === 'Aguardando Pagamento'
          ? 'Pendente'
          : row.items[0].status.name}
      </Badge>
    ),
    width: '120px',
  },
  {
    name: 'Pago em',
    cell: (row) =>
      row?.items[0].paid_at
        ? moment(row?.items[0].paid_at).format('DD/MM/YYYY HH:mm:ss')
        : '-',
    minWidth: '110px',
  },
]);

const Sales = () => {
  const [records, setRecords] = useState(null);
  const [recordsCount, setRecordsCount] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [loading, setLoading] = useState(null);
  const [inputFilter, setInputFilter] = useState('');
  const { skin } = useSkin();

  useEffect(() => {
    fetchData();
  }, [inputFilter]);

  const fetchData = async (page = 0, newPerPage = null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('page', page);
      query.append('size', newPerPage ? newPerPage : recordsPerPage);

      if (inputFilter) query.append('input', inputFilter);

      const response = await api.get(`/sales/ip?${query.toString()}`);
      setRecords(response.data.rows);
      setRecordsCount(response.data.count);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChange = async (newPerPage, page) => {
    await fetchData(page - 1, newPerPage);
    setRecordsPerPage(newPerPage);
  };

  const handleRecordsPageChange = (page) => {
    fetchData(page - 1);
  };

  return (
    <section id="pageSales">
      {records && (
        <>
          <Card>
            <CardBody>
              <div className="mb-2">
                <Label>IP</Label>
                <Input
                  onChange={({ target }) => {
                    setTimeout(() => {
                      setInputFilter(target.value);
                    }, 1000);
                  }}
                />
              </div>
            </CardBody>
          </Card>

          <Row>
            <Col>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h3 className="mb-0">Vendas</h3>
              </div>
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
                progressComponent={<Spinner />}
                noDataComponent={<>Não há vendas</>}
                theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
                paginationRowsPerPageOptions={[10, 20, 50, 100]}
              />
            </Col>
          </Row>
        </>
      )}
    </section>
  );
};

export default Sales;
