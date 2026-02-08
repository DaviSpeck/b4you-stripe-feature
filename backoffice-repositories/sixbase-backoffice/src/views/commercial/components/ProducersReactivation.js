import { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Card, CardBody, Input, Button, Spinner } from 'reactstrap';
import DataTable from 'react-data-table-component';
import { useSkin } from '../../../utility/hooks/useSkin';
import moment from 'moment';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  useGetReactivationProducersQuery,
  useUpdateReactivationStatusMutation,
} from '../../../redux/api/metricsApi';

import './ProducersReactivation.responsive.css';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

export default function ProducersReactivation() {
  const { skin } = useSkin();
  const DATE_FMT = 'DD/MM/YYYY';
  const today = moment();
  const isFirstOfMonth = today.date() === 1;

  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const debouncedName = useDebounce(nameFilter, 300);
  const debouncedEmail = useDebounce(emailFilter, 300);
  const debouncedStatus = useDebounce(statusFilter, 300);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const queryParams = useMemo(
    () => ({
      page,
      size,
      ...(debouncedName && { name: debouncedName }),
      ...(debouncedEmail && { email: debouncedEmail }),
      ...(debouncedStatus && { status: debouncedStatus }),
    }),
    [page, size, debouncedName, debouncedEmail, debouncedStatus],
  );

  const {
    data = { rows: [], count: 0 },
    isFetching,
    refetch,
  } = useGetReactivationProducersQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    keepUnusedDataFor: 0,
  });

  const [localData, setLocalData] = useState({ rows: [], count: 0 });

  useEffect(() => {
    if (!isFetching) {
      setLocalData(data);
    }
  }, [data, isFetching]);

  useEffect(() => {
    refetch();
    setPage(0);
  }, [debouncedName, debouncedEmail, debouncedStatus, refetch]);

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateReactivationStatusMutation();

  const handleStatusChange = useCallback(
    (uuid, newStatus) => {
      if (isFirstOfMonth) {
        toast.warning(
          'Só é possível mudar status a partir do dia 02 de cada mês.',
        );
        return;
      }
      updateStatus({ uuid, status: newStatus })
        .unwrap()
        .then(() => {
          setLocalData((prev) => ({
            ...prev,
            rows: prev.rows.map((r) =>
              r.uuid === uuid ? { ...r, reactivation_status: newStatus } : r,
            ),
          }));
        })
        .catch(() => {
          toast.error('Falha ao atualizar status.');
        });
    },
    [isFirstOfMonth, updateStatus],
  );

  const tokenString = localStorage.getItem('accessToken');
  const token = tokenString ? JSON.parse(tokenString) : null;
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(() => {
    setIsDownloading(true);
    fetch(
      `${
        process.env.REACT_APP_BASE_URL ||
        'https://api-backoffice.b4you.com.br'
      }/api/users/reactivation/producers/report`,
      {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      },
    )
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reativacao_produtores_${today.format('YYYY_MM')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        toast.error('Falha ao gerar o relatório. Tente novamente.');
      })
      .finally(() => setIsDownloading(false));
  }, [token, today]);

  const columns = useMemo(
    () => [
      { name: '#', width: '50px', cell: (_r, idx) => page * size + idx + 1 },
      { 
        name: 'Produtor',
        sortable: true,
        cell: (row) => {
          const pid = row?.uuid ?? row?.id ?? row?.producerId;
          return pid ? <a href={`/producer/${pid}`}>{row.name}</a> : row.name;
        }
      },
      { name: 'E-mail', selector: (r) => r.email, sortable: true, wrap: true },
      {
        name: 'Última Venda',
        selector: (r) => r.lastSaleDate,
        format: (r) =>
          r.lastSaleDate ? moment(r.lastSaleDate).format(DATE_FMT) : '—',
      },
      {
        name: 'Vendas Mês Ant.',
        selector: (r) => r.lastMonthSales,
        sortable: true,
        right: true,
      },
      {
        name: 'Status',
        cell: (row) => (
          <Input
            type="select"
            value={row.reactivation_status || ''}
            disabled={
              row.reactivation_status === 'success' ||
              isUpdating ||
              isFirstOfMonth
            }
            onChange={(e) => handleStatusChange(row.uuid, e.target.value)}
          >
            <option value="" disabled>
              Selecione...
            </option>
            <option value="not_contacted">Não contatado</option>
            <option value="contacting">Em contato</option>
            <option value="success" disabled>
              Sucesso
            </option>
          </Input>
        ),
      },
    ],
    [page, size, isUpdating, handleStatusChange, isFirstOfMonth],
  );

  const handlePageChange = (p) => setPage(p - 1);
  const handlePerRowsChange = (newSize, p) => {
    setSize(newSize);
    setPage(p - 1);
  };

  return (
    <>
      <Card className="mb-2">
        <CardBody>
          <Row form className="align-items-center filter-row-responsive">
            <Col xs="12" sm="6" md="3" className="mb-2 mb-md-0">
              <Input
                placeholder="Filtrar por nome"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </Col>
            <Col xs="12" sm="6" md="3" className="mb-2 mb-md-0">
              <Input
                placeholder="Filtrar por e-mail"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
              />
            </Col>
            <Col xs="12" sm="6" md="3" className="mb-2 mb-md-0">
              <Input
                type="select"
                value={statusFilter}
                disabled={isFirstOfMonth}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="not_contacted">Não contatado</option>
                <option value="contacting">Em contato</option>
                <option value="success">Sucesso</option>
              </Input>
            </Col>
            <Col
              xs="12"
              sm="6"
              md="3"
              className="text-md-right text-left mb-2 mb-md-0"
            >
              <Button
                color="primary"
                onClick={handleDownload}
                disabled={isDownloading}
                block
              >
                {isDownloading ? 'Gerando...' : 'Baixar relatório mensal'}
              </Button>
            </Col>
          </Row>
          {isFirstOfMonth && (
            <small className="text-warning d-block mt-1">
              Reset realizado hoje. Interações só a partir do dia 02.
            </small>
          )}
        </CardBody>
      </Card>

      <div className="datatable-responsive-wrapper">
        <DataTable
          columns={columns}
          data={localData.rows}
          progressPending={isFetching}
          pagination
          paginationServer
          paginationTotalRows={localData.count}
          paginationPerPage={size}
          paginationRowsPerPageOptions={[10, 20, 30]}
          paginationDefaultPage={page + 1}
          onChangeRowsPerPage={handlePerRowsChange}
          onChangePage={handlePageChange}
          noHeader
          noDataComponent={
            isFetching ? <Spinner /> : 'Nenhum produtor encontrado'
          }
          theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
          className="datatable-mobile"
        />
      </div>
    </>
  );
}
