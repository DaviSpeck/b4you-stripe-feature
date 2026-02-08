import memoizeOne from 'memoize-one';
import moment from 'moment';
import Select from 'react-select';
import { useEffect, useState } from 'react';
import { Col, Row, Tab, Tabs } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { toast } from 'react-toastify';
import AlertDS from '../../jsx/components/design-system/AlertDS';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import FilterListing from '../../jsx/components/FilterListing';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import PageTitle from '../../jsx/layouts/PageTitle';
import api from '../../providers/api';
import { useUser } from '../../providers/contextUser';
import formatDate from '../../utils/formatters';
import Loader from '../../utils/loader';
import { currency } from '../functions';
import NoDataComponentContent from '../NoDataComponentContent';
import BankAccount from '../settings/form/BankAccount';
import ModalCnpj from './modal-cnpj';
import ModalExpectedReceipt from './modal-expected-receipt';
import ModalFutures from './modal-futures';
import RequestWithdrawal from './request-widthdrawal';
import './style.scss';

const columns = memoizeOne(() => [
  {
    name: <RenderNameDataTable name='Data' color='#929597' />,
    selector: (item) => <span>{formatDate(item.created_at)}</span>,
    sortable: true,
  },
  {
    name: <RenderNameDataTable name='Valor' color='#929597' />,
    selector: (item) => (
      <span
        className={item.type.flow === 'outcome' ? 'text-danger' : undefined}
      >
        {item.type.flow === 'outcome'
          ? currency(item.amount * -1)
          : currency(item.amount)}
      </span>
    ),
    sortable: true,
  },
  {
    name: <RenderNameDataTable name='Status' color='#929597' />,
    selector: (item) => {
      let tooltip = '';

      switch (item.status?.name) {
        case 'Processado':
          tooltip = 'O valor já está disponível na conta bancária cadastrada.';
          break;
        case 'Negado':
          tooltip =
            'O saque não foi aprovado por divergências de informações. Entre em contato com o suporte.';
          break;
        case 'Pendente':
          tooltip =
            'O prazo para o saque ser creditado em sua conta é de 1 a 3 dias úteis. No entanto, o status da solicitação continuará aparecendo como pendente até que o banco confirme oficialmente que o valor foi creditado. Essa confirmação por parte do banco pode levar de 24 a 48 horas úteis após o crédito ter sido realizado.';
          break;
        default:
          tooltip = 'Status indefinido';
          break;
      }

      return (
        <div data-tip={tooltip} data-for={`tooltip-status-${item.id}`}>
          <BadgeDS variant={item.status.color} disc>
            {item.status.name}
          </BadgeDS>
          <ReactTooltip
            id={`tooltip-status-${item.id}`}
            place='top'
            effect='solid'
            type='dark'
            multiline={true}
            className='custom-tooltip'
            overridePosition={({ left, top }, _e, _t, node) => {
              const d = document.documentElement;
              const right = left + node.offsetWidth;
              const adjustedLeft =
                right > d.clientWidth
                  ? d.clientWidth - node.offsetWidth - 10
                  : left;
              return { top, left: adjustedLeft };
            }}
          />
        </div>
      );
    },
    sortable: true,
    width: '150px',
  },
]);

const getStatementStatusBadgeVariant = (transaction) => {
  const typeCode = transaction.type;
  const status = transaction.status;

  if (typeCode === 'activity') return 'secondary';

  switch (status) {
    case 'waiting':
      return 'warning';
    case 'released':
    case 'paid':
    case 'refunded':
      return 'success';
    case 'pending':
      return 'info';
    case 'chargeback':
    case 'chargeback_dispute':
      return 'danger';
    default:
      return 'secondary';
  }
};

const getStatementStatusLabel = (transaction) => {
  const { type, status, status_label } = transaction;

  if (type === 'activity' || !status) return '-';

  if (status_label) return status_label;

  const map = {
    waiting: 'Pendente',
    released: 'Liberada',
    pending: 'Pendente',
    paid: 'Processado',
    refunded: 'Reembolsado',
    chargeback: 'Chargeback',
    chargeback_dispute: 'Chargeback em disputa',
  };

  return map[status] || status || '-';
};

const statementColumns = memoizeOne(() => [
  {
    name: <RenderNameDataTable name='Data' color='#929597' />,
    selector: (item) => <span>{moment(item.date).format('DD/MM/YYYY')}</span>,
  },
  {
    name: <RenderNameDataTable name='Tipo' color='#929597' />,
    selector: (item) => <span>{item.type_label || item.type}</span>,
  },
  {
    name: <RenderNameDataTable name='Status' color='#929597' />,
    selector: (item) => (
      <BadgeDS variant={getStatementStatusBadgeVariant(item)} disc>
        {getStatementStatusLabel(item)}
      </BadgeDS>
    ),
    width: '230px',
  },
  {
    name: <RenderNameDataTable name='Valor' color='#929597' />,
    selector: (item) => (
      <span className={item.value < 0 ? 'text-danger' : undefined}>
        {currency(item.value)}
      </span>
    ),
    right: true,
  },
]);

const PageWallet = () => {
  const [modalRequestWithdrawalShow, setModalRequestWithdrawalShow] =
    useState(false);
  const [modalFuturesShow, setModalFuturesShow] = useState(false);
  const [modalExpectedReceipt, setModalExpectedReceipt] = useState(false);
  const [requesting, setRequesting] = useState(true);
  const [balanceAvailable, setBalanceAvailable] = useState(null);
  const [balanceBlocked, setBalanceBlocked] = useState(null);
  const [futureReleases, setFutureReleases] = useState([]);
  const [settings, setSettings] = useState(null);
  const [bankAccount, setBankAccount] = useState(null);
  const [maxWithdrawalAmount, setMaxWithdrawalAmount] = useState(null);
  const [withheld, setWithheld] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [records, setRecords] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [filterParams, setFilterParams] = useState(null);
  const [activeTab, setActiveTab] = useState('saques');
  const [userData, setUserData] = useState({
    general: null,
    access: null,
    company: null,
    address: null,
    bank_account: null,
  });
  const [openModalCNPJ, setOpenModalCNPJ] = useState(false);
  const [totalWithdrawal, setTotalWithdrawal] = useState(null);

  // Estados da tabela de Extrato (lista de extrato financeiro)
  const [statementItems, setStatementItems] = useState([]);
  const [statementTotalItems, setStatementTotalItems] = useState(0);
  const [statementTotalPages, setStatementTotalPages] = useState(1);
  const [statementMessage, setStatementMessage] = useState('');
  const [statementFinalBalance, setStatementFinalBalance] = useState(null);
  const [statementTypeFilter, setStatementTypeFilter] = useState({
    value: 'all',
    label: 'Todos os tipos',
  });
  const [statementPage, setStatementPage] = useState(1);
  const [statementPerPage, setStatementPerPage] = useState(10);
  const [statementError, setStatementError] = useState(null);
  const [statementLoading, setStatementLoading] = useState(false);

  // Estados do Extrato Financeiro
  const defaultDateRange = {
    startDate: moment().subtract(29, 'days').format('DD/MM/YYYY'),
    endDate: moment().format('DD/MM/YYYY'),
  };

  const calendarPreset = {
    start: moment(defaultDateRange.startDate, 'DD/MM/YYYY').toDate(),
    end: moment(defaultDateRange.endDate, 'DD/MM/YYYY').toDate(),
    option: 5,
  };

  const [filterParamsStatement, setFilterParamsStatement] =
    useState(defaultDateRange);
  const [validatedFilterParamsStatement, setValidatedFilterParamsStatement] =
    useState(defaultDateRange);
  const [showCalendarStatement, setShowCalendarStatement] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    if (!modalRequestWithdrawalShow) {
      fetchTransactions();
      setShowCalendar(false);
    }
  }, [filterParams, currentPage, perPage, modalRequestWithdrawalShow]);

  useEffect(() => {
    if (!modalRequestWithdrawalShow) {
      fetchBalance();
    }
  }, [filterParams, modalRequestWithdrawalShow]);

  const fetchBalance = () => {
    api
      .get(`/balance`)
      .then(({ data }) => {
        const {
          withheld_balance,
          withdrawal_settings,
          bank_account,
          available_balance,
          future_releases,
          max_withdrawal_amount,
          blocked,
          pending_balance,
          total_withdrawal,
        } = data;
        setMaxWithdrawalAmount(max_withdrawal_amount);
        setWithheld(withheld_balance);
        setBalanceBlocked(pending_balance);
        setSettings(withdrawal_settings);
        setBankAccount(bank_account);
        setBalanceAvailable(available_balance);
        setFutureReleases(future_releases);
        setBlocked(blocked);
        setTotalWithdrawal(total_withdrawal);
      })
      .catch(() => {})
      .finally(() => setRequesting(false));
  };

  const fetchTransactions = () => {
    setRequesting(true);
    api
      .get(`/balance/transactions?size=${perPage}&page=${currentPage}`, {
        params: filterParams ? filterParams : null,
      })
      .then((response) => {
        setRecords(response.data.rows);
        setTotalRows(response.data.count);
      })
      .catch(() => {})
      .finally(() => setRequesting(false));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page - 1);
  };

  useEffect(() => {
    api
      .get('/users/profile')
      .then((response) => {
        let data = response.data;
        setUserData(data);
      })
      .catch(() => {});
  }, []);

  // Funções do Extrato Financeiro
  useEffect(() => {
    if (
      filterParamsStatement &&
      Object.keys(filterParamsStatement).length > 0
    ) {
      setValidatedFilterParamsStatement(filterParamsStatement);
      setStatementPage(1);
    }
  }, [filterParamsStatement]);

  const normalizeDateForApi = (date) => {
    if (!date) return null;
    const parsed = moment(date, 'DD/MM/YYYY', true);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
  };

  const validateDateRange = () => {
    if (
      !validatedFilterParamsStatement.startDate ||
      !validatedFilterParamsStatement.endDate
    ) {
      return true;
    }

    const start = moment(
      validatedFilterParamsStatement.startDate,
      'DD/MM/YYYY'
    );
    const end = moment(validatedFilterParamsStatement.endDate, 'DD/MM/YYYY');
    const diffInMonths = end.diff(start, 'months', true);

    if (diffInMonths > 3) {
      toast.error('O período selecionado não pode ultrapassar 3 meses');
      return false;
    }

    return true;
  };

  const handleExport = async (format) => {
    if (!validateDateRange()) {
      return;
    }

    const startDate = normalizeDateForApi(
      validatedFilterParamsStatement.startDate
    );
    const endDate = normalizeDateForApi(validatedFilterParamsStatement.endDate);

    setExporting(true);

    const params = { format };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    try {
      const response = await api.get(`balance/transactions/statement`, {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `extrato-financeiro.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Arquivo exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar arquivo');
    } finally {
      setExporting(false);
    }
  };

  const handleFilterParamsChangeStatement = (params) => {
    if (params instanceof URLSearchParams) {
      const start = params.get('startDate');
      const end = params.get('endDate');

      if (start && end) {
        const formattedParams = {
          startDate: moment(start, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          endDate: moment(end, 'YYYY-MM-DD').format('DD/MM/YYYY'),
        };
        setFilterParamsStatement(formattedParams);
      }
    } else {
      setFilterParamsStatement(params);
    }
  };

  // Busca lista de extrato financeiro no backend
  useEffect(() => {
    const fetchStatement = async () => {
      setStatementLoading(true);
      setStatementError(null);

      const params = {
        page: statementPage,
        pageSize: statementPerPage,
      };

      const startDate = normalizeDateForApi(
        validatedFilterParamsStatement.startDate
      );
      const endDate = normalizeDateForApi(
        validatedFilterParamsStatement.endDate
      );

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      if (statementTypeFilter.value !== 'all') {
        params.types = statementTypeFilter.value;
      }

      try {
        const { data } = await api.get('balance/transactions/statement/list', {
          params,
        });

        setStatementItems(data.items || []);
        setStatementTotalItems(
          typeof data.totalItems === 'number'
            ? data.totalItems
            : (data.items || []).length
        );
        setStatementTotalPages(data.totalPages || 1);
        setStatementMessage(data.message || '');
        setStatementFinalBalance(
          typeof data.finalBalance === 'number' ? data.finalBalance : null
        );
      } catch (err) {
        setStatementError('Erro ao carregar extrato financeiro.');
        setStatementItems([]);
        setStatementTotalItems(0);
        setStatementTotalPages(1);
        setStatementMessage('');
        setStatementFinalBalance(null);
      } finally {
        setStatementLoading(false);
      }
    };

    fetchStatement();
  }, [
    validatedFilterParamsStatement.startDate,
    validatedFilterParamsStatement.endDate,
    statementTypeFilter,
    statementPage,
    statementPerPage,
  ]);

  return (
    <div id='page-wallet'>
      {bankAccount && settings && maxWithdrawalAmount !== null && (
        <RequestWithdrawal
          id={'modal-request-withdrawal'}
          title={'Requisitar Saque'}
          show={modalRequestWithdrawalShow}
          setShow={setModalRequestWithdrawalShow}
          footer={true}
          centered
          bankAccount={bankAccount}
          balanceAvailable={balanceAvailable}
          withheld={withheld}
          maxWithdrawalAmount={maxWithdrawalAmount}
          settings={settings}
        />
      )}

      <ModalGeneric
        show={modalFuturesShow}
        setShow={setModalFuturesShow}
        title={'Saldo pendente'}
        centered
      >
        <ModalFutures
          futures={futureReleases}
          withheld_balance={withheld}
          setModalFuturesShow={setModalFuturesShow}
          setModalExpectedReceipt={setModalExpectedReceipt}
        />
      </ModalGeneric>

      <ModalGeneric
        show={modalExpectedReceipt}
        setShow={setModalExpectedReceipt}
        title={'Previsão de Recebimentos'}
        centered
        size='lg'
      >
        <ModalExpectedReceipt />
      </ModalGeneric>

      <ModalCnpj
        show={openModalCNPJ}
        handleClose={() => setOpenModalCNPJ(!openModalCNPJ)}
      />

      <PageTitle title='Financeiro' />

      <section id='page-wallet'>
        <div className='metrics'>
          {!user.verified_id && (
            <div className='mb-4'>
              <AlertDS
                warn={'Aviso:'}
                variant={'danger'}
                text={
                  'você deve verificar sua identidade para realizar saques.'
                }
              >
                <Link to='/verificar-identidade'>
                  <ButtonDS size={'xs'} variant={'danger'} buttonWhite={true}>
                    Verificar agora
                  </ButtonDS>
                </Link>
              </AlertDS>
            </div>
          )}

          {blocked && (
            <div className='mb-4'>
              <AlertDS
                warn={'Aviso:'}
                variant={'danger'}
                text={
                  'Você está bloqueado para saques. Para mais informações, entre em contato com nosso suporte.'
                }
              />
            </div>
          )}

          <Row>
            <Col md={12}>
              <div className='card'>
                <div className='card-body'>
                  <div className='card-released blocked'>
                    <div className='card-body'>
                      <div
                        className='pointer'
                        onClick={() => {
                          setModalFuturesShow(true);
                        }}
                      >
                        <span>
                          Saldo pendente <i className='bx bx-info-circle' />
                        </span>
                        <h2>
                          {balanceBlocked !== null && !requesting ? (
                            currency(balanceBlocked, true)
                          ) : (
                            <i
                              className='bx bx-loader-alt bx-spin'
                              style={{ fontSize: 25 }}
                            />
                          )}
                        </h2>
                      </div>

                      <div>
                        <span>Total em Saque</span>
                        <h2>
                          {totalWithdrawal !== null && !requesting ? (
                            currency(totalWithdrawal, true)
                          ) : (
                            <i
                              className='bx bx-loader-alt bx-spin'
                              style={{ fontSize: 25 }}
                            />
                          )}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className='wrap-withdraw d-flex align-items-center gap-3'>
                    <div
                      className={`card-balance ${
                        balanceAvailable < 0 && 'card-balance-danger'
                      } mr-4`}
                    >
                      <div className='wrap-icon'>
                        <i className='bx bx-dollar' />
                      </div>
                      <div className='wrap-content'>
                        <span>Disponível para saque</span>

                        <h2>
                          {maxWithdrawalAmount !== null && !requesting ? (
                            currency(
                              balanceAvailable < 0 ? 0 : maxWithdrawalAmount
                            )
                          ) : (
                            <i
                              className='bx bx-loader-alt bx-spin'
                              style={{ fontSize: 25 }}
                            />
                          )}
                        </h2>
                      </div>
                    </div>

                    <ButtonDS
                      className='btn btn-primary'
                      onClick={() => {
                        setModalRequestWithdrawalShow(true);
                      }}
                      disabled={!user.verified_id || requesting || blocked}
                      iconRight='bx-chevron-right'
                      size='md'
                    >
                      {requesting ? (
                        <i
                          className='bx bx-loader-alt bx-spin'
                          style={{ fontSize: 25 }}
                        />
                      ) : (
                        <span>Efetuar Saque</span>
                      )}
                    </ButtonDS>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {activeTab === 'dados' && !user.cnpj && (
          <div className='d-flex align-items-center justify-content-center'>
            <ButtonDS
              size='md'
              className='mt-2 mt-md-0 mb-4 rounded-pill'
              style={{
                height: '50px',
                backgroundColor: '#5BEBD4',
                color: '#475569',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
              }}
              onClick={() => setOpenModalCNPJ(!openModalCNPJ)}
            >
              Eu quero alterar a minha conta para CNPJ
            </ButtonDS>
          </div>
        )}

        {activeTab === 'saques' && (
          <FilterListing
            setFilterParams={setFilterParams}
            pageFilter={'wallet'}
            calendar={true}
            showCalendar={showCalendar}
            setShowCalendar={setShowCalendar}
            showFilter={false}
            configData={{
              start: moment()
                .set('year', 2022)
                .startOf('year')
                .format(`DD/MM/YYYY`),
              end: moment().format(`DD/MM/YYYY`),
              option: 6,
            }}
          />
        )}

        {activeTab === 'extrato' && (
          <FilterListing
            setFilterParams={handleFilterParamsChangeStatement}
            pageFilter={'financial-statement'}
            calendar={true}
            showCalendar={showCalendarStatement}
            setShowCalendar={setShowCalendarStatement}
            showFilter={false}
            hideSearch={true}
            configData={calendarPreset}
            calendarFullWidth={true}
          />
        )}

        <Tabs
          defaultActiveKey='saques'
          className='p-4 tab-finance tabs-offer-new justify-content-center'
          variant='pills'
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
        >
          <Tab eventKey='saques' title='Saques'>
            <div className='tab-finance card'>
              <DataTable
                className='dataTables_wrapper'
                paginationComponentOptions={{
                  rowsPerPageText: 'Linhas por página',
                  rangeSeparatorText: 'de',
                  selectAllRowsItem: true,
                  selectAllRowsItemText: 'Todos',
                }}
                data={records}
                columns={columns()}
                striped
                highlightOnHover
                progressPending={requesting}
                progressComponent={
                  <div className='p-4'>
                    <Loader title='Carregando vendas...' />
                  </div>
                }
                noDataComponent={<NoDataComponentContent />}
                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationPerPage={perPage}
                onChangeRowsPerPage={handlePerRowsChange}
                onChangePage={handlePageChange}
              />
            </div>
          </Tab>
          {/* fix data */}
          <Tab eventKey='dados' title='Dados bancários'>
            <div className='tab-finance card p-4'>
              <BankAccount
                data={userData.bank_account}
                dataCNPJ={userData.bank_account_company}
                setData={setUserData}
                companyNumber={userData.company?.cnpj}
                documentNumber={
                  userData.general?.masked_document_number ||
                  userData.general?.document_number
                }
                bank_account_pending_approval={
                  userData.bank_account_pending_approval
                }
              />
            </div>
          </Tab>
          <Tab eventKey='extrato' title='Extrato'>
            <div className='tab-finance card p-4'>
              <style>{`
                #page-wallet .financial-statement-body {
                  display: flex;
                  flex-direction: column;
                  gap: 20px;
                }
              `}</style>
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <h4
                  className='mb-0'
                  style={{ fontWeight: '600', fontSize: '24px' }}
                >
                  Extrato Financeiro
                </h4>
              </div>

              {statementFinalBalance !== null && (
                <div className='d-flex flex-column align-items-start mb-3'>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: 18,
                      color: statementFinalBalance < 0 ? '#EF4444' : '#111827',
                    }}
                  >
                    {currency(statementFinalBalance)}
                  </span>
                  <span style={{ fontSize: 14, color: '#6B7280' }}>
                    Total do extrato ao final do período selecionado
                  </span>
                </div>
              )}

              <div className='financial-statement-body'>
                {statementError && (
                  <AlertDS
                    variant='danger'
                    text='Ocorreu um erro ao carregar o extrato financeiro. Tente novamente mais tarde.'
                  />
                )}

                {!statementError &&
                  statementMessage &&
                  statementItems.length === 0 && (
                    <AlertDS variant='info' text={statementMessage} />
                  )}

                <div className='financial-statement-filters'>
                  <div className='financial-statement-filters__left'>
                    <ButtonDS
                      variant='primary'
                      size='sm'
                      disabled={exporting}
                      onClick={() => handleExport('csv')}
                    >
                      {exporting ? 'Exportando...' : 'Exportar CSV'}
                    </ButtonDS>
                    <ButtonDS
                      variant='primary'
                      size='sm'
                      disabled={exporting}
                      onClick={() => handleExport('pdf')}
                    >
                      {exporting ? 'Exportando...' : 'Exportar PDF'}
                    </ButtonDS>
                  </div>

                  <div className='financial-statement-filters__right'>
                    <span className='financial-statement-filters__label'>
                      Filtrar por tipo:
                    </span>
                    <Select
                      options={[
                        { value: 'all', label: 'Todos os tipos' },
                        { value: 'commission', label: 'Comissão' },
                        { value: 'withdrawal', label: 'Saque' },
                        { value: 'refund', label: 'Reembolso' },
                        { value: 'chargeback', label: 'Chargeback' },
                      ]}
                      placeholder='Selecione...'
                      value={statementTypeFilter}
                      isSearchable={false}
                      onChange={(option) => {
                        setStatementTypeFilter(option);
                        setStatementPage(1);
                      }}
                      styles={{
                        container: (provided) => ({
                          ...provided,
                          width: 220,
                          '@media (max-width: 576px)': {
                            width: '100%',
                          },
                        }),
                        control: (provided, state) => ({
                          ...provided,
                          borderRadius: '12px',
                          height: '40px',
                          borderColor: state.isFocused ? '#5bebd4' : '#dadce0',
                          boxShadow: 'none',
                          '&:hover': {
                            borderColor: state.isFocused
                              ? '#5bebd4'
                              : '#dadce0',
                          },
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: '#aaa',
                          fontSize: '14px',
                          fontWeight: '400',
                        }),
                      }}
                    />
                  </div>
                </div>

                <div className='mt-4'>
                  <DataTable
                    className='dataTables_wrapper'
                    paginationComponentOptions={{
                      rowsPerPageText: 'Linhas por página',
                      rangeSeparatorText: 'de',
                      selectAllRowsItem: true,
                      selectAllRowsItemText: 'Todos',
                    }}
                    data={statementItems}
                    columns={statementColumns()}
                    striped
                    highlightOnHover
                    progressPending={statementLoading}
                    progressComponent={
                      <div className='p-4'>
                        <Loader title='Carregando extrato...' />
                      </div>
                    }
                    noDataComponent={<NoDataComponentContent />}
                    pagination
                    paginationServer
                    paginationPerPage={statementPerPage}
                    paginationRowsPerPageOptions={[10, 25, 50, 100]}
                    paginationDefaultPage={statementPage}
                    paginationTotalRows={statementTotalItems}
                    onChangePage={(page) => setStatementPage(page)}
                    onChangeRowsPerPage={(newPerPage, page) => {
                      setStatementPerPage(newPerPage);
                      setStatementPage(page);
                    }}
                  />
                  <div className='d-flex justify-content-between align-items-center mt-2'>
                    <small style={{ color: '#6B7280' }}>
                      Mostrando {statementItems.length} registro(s) filtrado(s)
                    </small>
                    <small style={{ color: '#6B7280' }}>
                      Página {statementPage} de {statementTotalPages}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </Tab>
        </Tabs>
      </section>
    </div>
  );
};

export default PageWallet;
