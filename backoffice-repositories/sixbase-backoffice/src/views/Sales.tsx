import moment from 'moment';
import { useState, useEffect, useCallback, FC, useRef } from 'react';
import { api } from '../services/api';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Input,
  Row,
  Spinner,
} from 'reactstrap';
import { Calendar, Settings, RefreshCw, Search, Download } from 'react-feather';
import LoadingSpinner from '../components/LoadingSpinner';
import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import '@styles/react/libs/charts/recharts.scss';
import DataTable from 'react-data-table-component';
import memoizeOne from 'memoize-one';
import { FormatBRL } from '../utility/Utils';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ViewStudentSales from './students/ViewStudentSales';
import {
  SalesRecord,
  Column,
  FilterState,
  Status,
  ApiResponse,
} from '../interfaces/sales.interface';
import { useSkin } from '../utility/hooks/useSkin';

const columns = memoizeOne(
  (
    setShowSalesDetails: (show: boolean) => void,
    getStudentData: (studentUuid: string, uuid: string) => void,
  ): Column[] => [
    {
      name: 'Data',
      cell: (row: SalesRecord) =>
        moment(row?.created_at).format('DD/MM/YYYY HH:mm:ss'),
      width: '110px',
    },
    {
      name: 'Produto',
      cell: (row: SalesRecord) => (
        <Link
          to={`/producer/${row?.product?.producer?.uuid}/product/${row?.product?.uuid}`}
        >
          {row?.product?.name}
        </Link>
      ),
      minWidth: '190px',
    },
    {
      name: 'Cliente',
      cell: (row: SalesRecord) => (
        <Link to={`/student/${row?.student?.uuid}`}>
          {row?.student?.full_name}
        </Link>
      ),
      minWidth: '220px',
    },
    {
      name: 'Valor',
      cell: (row: SalesRecord) => FormatBRL(row?.price),
      width: '110px',
    },
    {
      name: 'Metodo',
      width: '90px',
      cell: (row: SalesRecord) =>
        row.payment_method.label === 'Cartão de Crédito'
          ? 'Cartão'
          : row.payment_method.label,
    },
    {
      name: 'Status',
      cell: (row: SalesRecord) => (
        <Badge color={row?.status?.color}>
          {row.status.name === 'Aguardando Pagamento'
            ? 'Pendente'
            : row.status.name}
        </Badge>
      ),
      width: '90px',
    },
    {
      name: 'Afiliado',
      cell: ({ affiliate }: SalesRecord) =>
        affiliate ? (
          <Link to={`/producer/${affiliate.uuid}`}>{affiliate.full_name}</Link>
        ) : (
          ' - '
        ),
    },
    {
      name: 'Pago em',
      cell: (row: SalesRecord) => row?.paid_at,
      minWidth: '110px',
    },
    {
      name: 'Detalhes',
      cell: (row: SalesRecord) => (
        <Badge
          color="primary"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            getStudentData(row.student.uuid, row.uuid);
            setShowSalesDetails(true);
          }}
        >
          <Settings size={21} />
        </Badge>
      ),
    },
  ],
);

const configNotify = {
  position: 'top-right' as const,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

const salesCache = new Map();
const CACHE_TTL = 2 * 60 * 1000;

const Sales: FC = () => {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [records, setRecords] = useState<SalesRecord[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [recordsCount, setRecordsCount] = useState<number>(0);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [showSalesDetails, setShowSalesDetails] = useState<boolean>(false);
  const [filter, setFilter] = useState<FilterState>({
    page: 1,
    size: 10,
    totalRows: 0,
    calendar: [moment().startOf('month').toDate(), moment().toDate()],
  });
  const [loading, setLoading] = useState<boolean | null>(null);
  const [requesting, setRequesting] = useState<boolean>(false);

  const [status, setStatus] = useState<Status[] | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [activePayment, setActivePayment] = useState<string>('all');
  const [student, setStudent] = useState<any>(null);
  const [recordsStudent, setRecordsStudent] = useState<any>(null);
  const [inputFilter, setInputFilter] = useState<string>('');
  const [refresh, setRefresh] = useState<boolean>(false);
  const { skin } = useSkin();

  useEffect(() => {
    fetchStatus();
  }, [filter, activeStatus, activePayment]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchData(0, null, inputFilter);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputFilter, filter, activeStatus, activePayment, refresh]);

  const fetchStatus = (): void => {
    setLoading(true);
    api
      .get<Status[]>('/sales/status')
      .then((r) => setStatus(r.data))
      .catch((err) => console.log(err));
    setLoading(false);
  };

  const fetchData = useCallback(
    async (
      page: number = 0,
      newPerPage: number | null = null,
      search: string = '',
    ): Promise<void> => {
      const perPage = newPerPage ? newPerPage : recordsPerPage;
      const cacheKey = `sales_${page}_${perPage}_${search}_${activeStatus}_${activePayment}_${moment(
        filter.calendar[0],
      ).format('YYYY-MM-DD')}_${moment(filter.calendar[1]).format(
        'YYYY-MM-DD',
      )}`;

      const cached = salesCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setRecords(cached.data.rows);
        setTotal(cached.data.total);
        setRecordsCount(cached.data.count);
        return;
      }

      setLoading(true);
      try {
        const query = new URLSearchParams();
        query.append('page', page.toString());
        query.append('size', perPage.toString());
        query.append('id_status', activeStatus);
        query.append('payment_method', activePayment);

        if (search) query.append('input', search);

        const response = await api.get<ApiResponse>(
          `/sales/overall?start_date=${moment(filter.calendar[0]).format(
            'YYYY-MM-DD',
          )}&end_date=${moment(filter.calendar[1]).format(
            'YYYY-MM-DD',
          )}&${query.toString()}`,
        );

        salesCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
        });

        setRecords(response.data.rows);
        setTotal(response.data.total);
        setRecordsCount(response.data.count);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    },
    [recordsPerPage, filter.calendar, activeStatus, activePayment],
  );

  const handleRecordsPerPageChange = useCallback(
    async (newPerPage: number, page: number): Promise<void> => {
      await fetchData(page - 1, newPerPage, inputFilter);
      setRecordsPerPage(newPerPage);
    },
    [fetchData, inputFilter],
  );

  const handleRecordsPageChange = useCallback(
    (page: number): void => {
      fetchData(page - 1, null, inputFilter);
    },
    [fetchData, inputFilter],
  );

  const handleChangeStatus = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    e.preventDefault();
    const value = e.target.value;
    setActiveStatus(value);
  };

  const handleChangePayment = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    e.preventDefault();
    const value = e.target.value;
    setActivePayment(value);
  };

  const submitExport = useCallback((): void => {
    if (moment(filter.calendar[1]).diff(moment(filter.calendar[0]), 'd') > 31) {
      toast.error(
        'Selecione o máximo de 31 dias para exportar as vendas',
        configNotify,
      );
      return;
    }
    toast.success('Exportando... Essa operação pode demorar', configNotify);
    setRequesting(true);
    const query = new URLSearchParams();
    query.append('payment_method', activePayment);
    query.append('id_status', activeStatus);
    if (inputFilter) {
      query.append('input', inputFilter);
    }
    api
      .get(
        `sales/export?start_date=${moment(filter.calendar[0]).format(
          'YYYY-MM-DD',
        )}&end_date=${moment(filter.calendar[1]).format(
          'YYYY-MM-DD',
        )}&format=xlsx&${query.toString()}`,
        {
          responseType: 'blob',
        },
      )
      .then((r) => {
        const url = window.URL.createObjectURL(new Blob([r.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `vendas_${moment(filter.calendar[0]).format('YYYY-MM-DD')}_${moment(
            filter.calendar[1],
          ).format('YYYY-MM-DD')}.xlsx`,
        );
        document.body.appendChild(link);
        link.click();
        toast.success('Exportado com sucesso', configNotify);
      })
      .catch((err) => toast.error('Erro ao baixar arquivo', configNotify))
      .finally(() => setRequesting(false));
  }, [filter.calendar, activePayment, activeStatus, inputFilter]);

  const submitExportCharges = useCallback((): void => {
    if (moment(filter.calendar[1]).diff(moment(filter.calendar[0]), 'd') > 31) {
      toast.error(
        'Selecione o máximo de 31 dias para exportar as vendas',
        configNotify,
      );
      return;
    }
    toast.success('Exportando... Essa operação pode demorar', configNotify);
    setRequesting(true);
    const query = new URLSearchParams();
    query.append('payment_method', activePayment);
    query.append('id_status', activeStatus);
    if (inputFilter) {
      query.append('input', inputFilter);
    }
    api
      .get(
        `sales/export-charges?start_date=${moment(filter.calendar[0]).format(
          'YYYY-MM-DD',
        )}&end_date=${moment(filter.calendar[1]).format(
          'YYYY-MM-DD',
        )}&format=xlsx&${query.toString()}`,
        {
          responseType: 'blob',
        },
      )
      .then((r) => {
        const url = window.URL.createObjectURL(new Blob([r.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `cobrancas_${moment(filter.calendar[0]).format(
            'YYYY-MM-DD',
          )}_${moment(filter.calendar[1]).format('YYYY-MM-DD')}.xlsx`,
        );
        document.body.appendChild(link);
        link.click();
        toast.success('Exportado com sucesso', configNotify);
      })
      .catch((err) => toast.error('Erro ao baixar arquivo', configNotify))
      .finally(() => setRequesting(false));
  }, [filter.calendar, activePayment, activeStatus, inputFilter]);

  const getStudentData = (studentUuid: string, uuid: string): void => {
    setLoading(true);
    api
      .get(`/sales/${uuid}`)
      .then((r) => {
        setRecordsStudent(r.data);
      })
      .catch((e) => console.log(e));
    setLoading(false);
  };

  return (
    <section id="pageSales">
      {status && records && (
        <>
          {recordsStudent && (
            <ViewStudentSales
              student={student}
              show={showSalesDetails}
              toggle={() => setShowSalesDetails(!showSalesDetails)}
              data={recordsStudent}
              canRefund={false}
              getStudentData={getStudentData}
            />
          )}

          <Card>
            <CardHeader className="flex-sm-row flex-column justify-content-sm-between justify-content-center align-items-sm-center align-items-start">
              <CardTitle tag="h4">
                <h5 className="mb-0">Total</h5>
                <div className="h3 pt-0 pb-0 text-primary">
                  {total !== null && total >= 0 ? (
                    FormatBRL(total)
                  ) : (
                    <Spinner />
                  )}
                </div>
              </CardTitle>
              <div className="d-flex flex-row">
                <div className="d-flex align-items-center ml-2">
                  <Calendar size={15} className="ml-2" />
                  <Flatpickr
                    className="form-control flat-picker bg-transparent border-0 shadow-none"
                    style={{ width: '210px' }}
                    value={filter.calendar}
                    onChange={(date: Date[]) =>
                      setFilter((prev) => ({ ...prev, calendar: date }))
                    }
                    options={{
                      mode: 'range',
                      // eslint-disable-next-line no-mixed-operators
                      dateFormat: 'd/m/Y',
                    }}
                  />
                </div>
                <div className="d-flex gap-1">
                  <div className="d-flex">
                    <select name="status" onChange={handleChangeStatus}>
                      <option value={'all'}>Todos</option>
                      {status.map((item) => {
                        return (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="d-flex">
                    <select
                      name="payment"
                      className="ml-2"
                      onChange={handleChangePayment}
                    >
                      <option value={'all'}>Todos</option>
                      <option value={'pix'}>Pix</option>
                      <option value={'billet'}>Boleto</option>
                      <option value={'card'}>Cartão</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardBody>
              <Row className="mb-2">
                <Col md="6">
                  <div className="d-flex align-items-center">
                    <Search size={16} className="me-2" />
                    <Input
                      type="text"
                      placeholder="ID / Nome do produto / Nome do cliente / E-mail ou CPF"
                      value={inputFilter}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setInputFilter(e.target.value);
                      }}
                    />
                  </div>
                </Col>
                <Col md="6" className="d-flex justify-content-end">
                  <div className="d-flex gap-2">
                    <Button
                      color="primary"
                      onClick={submitExport}
                      className="d-inline-flex align-items-center"
                    >
                      {requesting ? <LoadingSpinner /> : <Download size={16} />}
                      <span className="ms-2">
                        {requesting ? 'Exportando...' : 'Exportar Vendas'}
                      </span>
                    </Button>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>

          <Row>
            <Col>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h3 className="mb-0">Vendas</h3>
                <Button
                  color="primary"
                  onClick={() => {
                    setRefresh(!refresh);
                  }}
                >
                  {loading ? <Spinner size="sm" /> : <RefreshCw size={15} />}
                </Button>
              </div>
              <DataTable
                columns={columns(setShowSalesDetails, getStudentData)}
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
