import memoizeOne from 'memoize-one';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
  Table,
} from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import PageTitle from '../../../jsx/layouts/PageTitle';
import api from '../../../providers/api';
import Loader from '../../../utils/loader';
import { notify } from '../../functions';
import NoDataComponentContent from '../../NoDataComponentContent';
import ModalRule from './modal-rule';
import { eventOptions, statusOptions } from './options';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: '12px',
    height: '40px',
    borderColor: state.isFocused ? '#222' : '#dadce0',
    boxShadow: 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#222' : '#dadce0',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#aaa',
    fontSize: '14px',
    fontWeight: '400',
  }),
};

const columns = memoizeOne(({ setBody, setModalBody, handleResendHistory }) => [
  {
    name: 'ID',
    cell: (item) => item.id,
    width: '90px',
    center: true,
  },
  {
    name: 'Cliente',
    width: '250px',
    cell: (item) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 'bold' }}>
          {item?.body?.customer?.full_name || item?.body?.affiliate?.name}
        </span>
        <span style={{ fontSize: 'smaller', color: '#555' }}>
          {item?.body?.customer?.email || item?.body?.affiliate?.email}
        </span>
      </div>
    ),
  },
  {
    name: 'Evento',
    cell: (item) => item.event.label ?? '-',
  },
  {
    name: 'Envio em',
    cell: (item) =>
      item.sent_at
        ? moment(item.sent_at).format('DD/MM/YYYY HH:mm:ss')
        : moment(item.created_at).format('DD/MM/YYYY HH:mm:ss'),
    width: '120px',
    center: true,
  },
  {
    name: 'Status',
    center: true,
    width: '120px',
    cell: (item) =>
      (item.response_status &&
        (item.response_status.startsWith('2')
          ? `🟢 ${item.response_status}`
          : `🔴 ${item.response_status}`)) ||
      `🔴 400`,
  },
  {
    name: 'Tentativas',
    cell: (item) => item.tries,
    center: true,
    width: '120px',
  },
  {
    name: 'Evento',
    center: true,
    cell: (item) => {
      return (
        <div className='d-flex justify-content-center'>
          {item.response_status && !item.response_status.startsWith('2') && (
            <ButtonDS
              size='icon'
              className='mr-2'
              variant='danger'
              onClick={() => handleResendHistory(item)}
            >
              <i className='bx bx-send'></i>
            </ButtonDS>
          )}

          <ButtonDS
            size='icon'
            variant='primary'
            onClick={async () => {
              setBody(item.body);
              setModalBody(true);
            }}
          >
            <i className='fa fa-tasks'></i>
          </ButtonDS>
        </div>
      );
    },
  },
]);

const PageAppsWebhooks = () => {
  const [showModal, setShowModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [webhooks, setWebhooks] = useState([]);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [itemCancel, setItemCancel] = useState(null);
  const [itemEdit, setItemEdit] = useState(null);
  const [itemTest, setItemTest] = useState(null);
  const [itemHistory, setItemHistory] = useState(null);
  const [events, setEvents] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyDataCount, setHistoryDataCount] = useState([]);
  const [body, setBody] = useState({});
  const [showBody, setModalBody] = useState(false);
  const [copied, setCopied] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [eventFilter, setEventFilter] = useState({
    value: 'all',
    label: 'Todos os eventos',
  });
  const [statusFilter, setStatusFilter] = useState({
    value: 'all',
    label: 'Todos os status',
  });
  const [dateFilter, setDateFilter] = useState(null);

  const { register, handleSubmit, formState } = useForm({
    mode: 'onChange',
  });

  const { isValid } = formState;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchData = () => {
    api
      .get('/integrations/webhooks')
      .then((response) => {
        const { data } = response;

        setWebhooks(data.rows);
      })
      .catch(() => {});
  };

  const fetchEvents = () => {
    api
      .get('/integrations/events')
      .then((response) => {
        const { data } = response;
        setEvents(data.filter(({ id }) => id !== 4 && id !== 9));
      })
      .catch(() => {});
  };

  const fetchLogsWebhooks = async () => {
    try {
      setLoadingHistory(true);

      if (itemHistory) {
        const { data } = await api.get(
          `/integrations/webhooks/logs/history/${itemHistory.id}?size=${perPage}&page=${currentPage}&event=${eventFilter.value}&status=${statusFilter.value}&date=${dateFilter}`
        );

        const { rows, count } = data;

        setHistoryDataCount(count);
        setHistoryData(rows);
      }
    } catch (error) {
      return error;
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page - 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const handleShowModal = (value, clearEdit = false) => {
    if (clearEdit) setItemEdit(null);
    setShowModal(value);
  };

  const handleEdit = (item) => {
    setItemEdit(item);
    setShowModal(true);
  };

  const handleTest = (item) => {
    setItemTest(item);
    setShowTestModal(true);
  };

  const handleDelete = () => {
    api
      .delete(`/integrations/webhooks/${itemCancel.uuid}`)
      .then(() => {
        fetchData();
        setModalCancelShow(false);
        notify({
          message: 'Webhook removido com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao remover o webhook',
          type: 'error',
        });
      })
      .finally(() => {
        setModalCancelShow(false);
      });
  };

  const onSubmit = (data) => {
    setRequesting(true);
    api
      .post('integrations/webhooks/test', {
        id_event: data.id_event,
        url: itemTest.url,
        token: itemTest.token,
      })
      .then(() => {
        notify({
          message: 'Teste enviado com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao enviar teste',
          type: 'error',
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  const handleResendHistory = async (item) => {
    try {
      setLoadingHistory(true);

      await api.post('integrations/webhooks/resend', {
        url: itemHistory.url,
        token: itemHistory.token,
        id: item.id,
        reqBody: item.body,
      });

      notify({
        message: 'Integração reenviada com sucesso',
        type: 'success',
      });
    } catch (error) {
      notify({
        message: 'Falha ao reenviar a integração. Tente novamente mais tarde.',
        type: 'error',
      });

      return error;
    } finally {
      setLoadingHistory(false);
      fetchLogsWebhooks();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchLogsWebhooks();
  }, [
    currentPage,
    perPage,
    itemHistory,
    eventFilter,
    statusFilter,
    dateFilter,
  ]);

  useEffect(() => {
    fetchEvents();
  }, [showTestModal]);

  useEffect(() => {
    if (!showHistoryModal) {
      setEventFilter({
        value: 'all',
        label: 'Todos os eventos',
      });

      setStatusFilter({
        value: 'all',
        label: 'Todos os status',
      });

      setDateFilter(null);
    }
  }, [showHistoryModal]);

  return (
    <>
      <PageTitle
        title='Webhooks'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Webhooks' },
        ]}
      />
      <ModalGeneric
        show={showModal}
        setShow={
          itemEdit
            ? (value) => handleShowModal(value, true)
            : (value) => handleShowModal(value)
        }
        title={itemEdit ? 'Editar Webhook' : 'Novo Webhook'}
        centered
      >
        <ModalRule
          setShow={handleShowModal}
          fetchData={fetchData}
          webhook={itemEdit}
        />
      </ModalGeneric>

      <ModalGeneric
        show={showHistoryModal}
        setShow={setShowHistoryModal}
        title='Histórico'
        centered
        size='xl'
      >
        <Col>
          <div className='mb-3'>
            <h5>Filtros:</h5>

            <div className='d-flex flex-column flex-lg-row w-100'>
              <Select
                options={eventOptions}
                placeholder='Selecione o evento'
                value={eventFilter}
                onChange={(option) => setEventFilter(option)}
                className='w-100 mr-0 mr-lg-2 mb-2 mb-lg-0'
                styles={customStyles}
              />

              <Select
                placeholder='Selecione o status'
                value={statusFilter}
                onChange={(option) => setStatusFilter(option)}
                options={statusOptions}
                className='w-100 mr-0 mr-lg-2 mb-2 mb-lg-0'
                styles={customStyles}
              />

              <input
                type='date'
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value || null)}
                onKeyDown={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  border: '1px solid #dadce0',
                  padding: '8px',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div className='container-datatable card'>
            <DataTable
              paginationComponentOptions={{
                rowsPerPageText: 'Linhas por página',
                rangeSeparatorText: 'de',
                selectAllRowsItem: false,
                selectAllRowsItemText: 'Todos',
              }}
              progressPending={loadingHistory}
              progressComponent={
                <div className='p-4'>
                  <Loader title='Carregando webhooks...' />
                </div>
              }
              noDataComponent={<NoDataComponentContent />}
              columns={columns({ setBody, setModalBody, handleResendHistory })}
              data={historyData}
              striped
              highlightOnHover
              paginationRowsPerPageOptions={[10, 20, 50]}
              pagination
              paginationServer
              paginationTotalRows={historyDataCount}
              paginationPerPage={perPage}
              onChangeRowsPerPage={handlePerRowsChange}
              onChangePage={handlePageChange}
            />
          </div>
        </Col>
      </ModalGeneric>

      <ModalGeneric
        show={showBody}
        setShow={setModalBody}
        title={
          <Row className='align-items-center'>
            <Col>Evento</Col>
            <Col className='text-right'>
              <Button
                variant='outline-primary'
                onClick={() => copyToClipboard(body)}
                size='sm'
              >
                Copiar
              </Button>
            </Col>
          </Row>
        }
        centered
        size='lg'
      >
        <Col>
          {copied && (
            <Alert variant='success'>
              Copiado para a área de transferência!
            </Alert>
          )}
          <div
            className=''
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              backgroundColor: '#f0f0f0',
              padding: '10px',
              borderRadius: '5px',
              color: '#333',
              border: '1px solid #ccc',
              overflowX: 'auto',
            }}
          >
            <div>{JSON.stringify(body, null, 2)}</div>
          </div>
        </Col>
      </ModalGeneric>

      <ModalGeneric
        show={showTestModal}
        setShow={setShowTestModal}
        title='Testar Webhook'
        centered
      >
        <Col xs={12}>
          <div className='form-group'>
            <label htmlFor=''>URL do Webhook</label>
            <InputGroup>
              <Form.Control name='url' value={itemTest?.url} disabled={true} />
            </InputGroup>
          </div>
        </Col>
        <Col xs={12}>
          <div className='form-group'>
            <label htmlFor=''>Eventos</label>
            <Form.Control as='select' ref={register()} name='id_event'>
              {events?.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.label}
                </option>
              ))}
            </Form.Control>
          </div>
        </Col>
        <Col xs={12} className='d-flex justify-content-end'>
          <ButtonDS
            size={'sm'}
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || requesting}
          >
            {!requesting ? 'Testar' : 'Testando...'}
          </ButtonDS>
        </Col>
      </ModalGeneric>

      <section id='page-apps'>
        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Nome</th>
                  <th>Produto(s)</th>
                  <th>URL</th>
                  <th width='130' className='text-center'>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {webhooks.map((item) => {
                  return (
                    <tr key={`webhook_${item.uuid}`}>
                      <td className='text-center'>
                        {item.invalid ? (
                          <ButtonDS size='icon' variant='danger'>
                            <i
                              className='bx bx-error'
                              style={{ fontSize: 20 }}
                            ></i>
                          </ButtonDS>
                        ) : (
                          <ButtonDS size='icon' variant='success'>
                            <i
                              className='bx bx-check'
                              style={{ fontSize: 22 }}
                            ></i>
                          </ButtonDS>
                        )}
                      </td>
                      <td
                        onClick={() => {
                          handleEdit(item);
                        }}
                      >
                        <span className='link-label'>{item.name}</span>
                      </td>
                      <td>
                        {item.product
                          ? item.product.name
                          : item.is_affiliate
                          ? 'Todos que sou afiliado'
                          : item.is_supplier
                          ? 'Todos que sou fornecedor'
                          : 'Todos que sou produtor'}
                      </td>
                      <td style={{ maxWidth: '350px' }}>{item.url}</td>
                      <td className='d-flex justify-content-center'>
                        <div className='mr-1'>
                          <ButtonDS
                            size='icon'
                            variant='success'
                            onClick={() => {
                              setItemHistory(item);
                              setShowHistoryModal(!showHistoryModal);
                            }}
                          >
                            <i className='fa fa-history'></i>
                          </ButtonDS>
                        </div>
                        <div className='mr-1'>
                          <ButtonDS
                            size='icon'
                            variant='light'
                            onClick={() => {
                              handleTest(item);
                            }}
                          >
                            <i className='fa fa-wrench'></i>
                          </ButtonDS>
                        </div>
                        <div className='mr-1'>
                          <ButtonDS
                            size='icon'
                            onClick={() => {
                              handleEdit(item);
                            }}
                          >
                            <i className='bx bxs-pencil'></i>
                          </ButtonDS>
                        </div>

                        <ButtonDS
                          size='icon'
                          variant='danger'
                          onClick={() => {
                            setItemCancel(item);
                            setModalCancelShow(true);
                          }}
                        >
                          <i className='bx bx-trash-alt'></i>
                        </ButtonDS>
                      </td>
                    </tr>
                  );
                })}
                {webhooks.length === 0 && (
                  <tr>
                    <td colSpan='100' className='text-center'>
                      Não há webhooks cadastrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        <div className='mt-4'>
          <ButtonDS
            size='sm'
            onClick={() => {
              setShowModal(true);
            }}
          >
            Nova Integração
          </ButtonDS>
        </div>

        {modalCancelShow && (
          <ConfirmAction
            title={'Remover Webhook'}
            show={modalCancelShow}
            setShow={setModalCancelShow}
            handleAction={handleDelete}
            buttonText={'Remover'}
            centered
          />
        )}
      </section>
    </>
  );
};

export default PageAppsWebhooks;
