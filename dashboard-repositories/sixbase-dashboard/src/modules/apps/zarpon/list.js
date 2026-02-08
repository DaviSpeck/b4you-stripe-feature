import { useEffect, useState } from 'react';
import {
  Card,
  Col,
  Form,
  InputGroup,
  Table,
  Button,
  Row,
  Alert,
} from 'react-bootstrap';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import PageTitle from '../../../jsx/layouts/PageTitle';
import api from '../../../providers/api';
import ModalRule from './modal-rule';
import { notify } from '../../functions';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import { useForm } from 'react-hook-form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import DataTable from 'react-data-table-component';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import Loader from '../../../utils/loader';
import NoDataComponentContent from '../../NoDataComponentContent';

const columns = memoizeOne(({ setBody, setModalBody }) => [
  {
    name: 'ID',
    cell: (item) => item.id,
    width: '90px',
    center: true,
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
    cell: (item) =>
      item.response_status.startsWith('2')
        ? `🟢 ${item.response_status}`
        : `🔴 ${item.response_status}`,
  },
  {
    name: 'Tentativas',
    cell: (item) => item.tries,
    center: true,
  },
  {
    name: 'Evento',
    center: true,
    cell: (item) => (
      <div className='mr-1'>
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
    ),
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
      .get('/integrations/webhooks?id_type=2')
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
      if (itemHistory) {
        const { data } = await api.get(
          `/integrations/webhooks/logs/history/${itemHistory.id}?size=${perPage}&page=${currentPage}`
        );
        const { rows, count } = data;
        setHistoryDataCount(count);
        setHistoryData(rows);
        setShowHistoryModal(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page - 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  useEffect(() => {
    fetchLogsWebhooks();
  }, [currentPage, perPage, itemHistory]);

  useEffect(() => {
    fetchEvents();
  }, [showTestModal]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleShowModal = (value, clearEdit = false) => {
    if (clearEdit) setItemEdit(null);
    setShowModal(value);
  };

  const handleEdit = (item) => {
    setItemEdit(item);
    setShowModal(true);
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

  return (
    <>
      <PageTitle
        title='Zarpon'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Zarpon' },
        ]}
      />
      <ModalGeneric
        show={showModal}
        setShow={
          itemEdit
            ? (value) => handleShowModal(value, true)
            : (value) => handleShowModal(value)
        }
        title={itemEdit ? 'Editar Integração' : 'Nova Integração'}
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
        size='lg'
      >
        <Col>
          <div className='container-datatable card'>
            <DataTable
              paginationComponentOptions={{
                rowsPerPageText: 'Linhas por página',
                rangeSeparatorText: 'de',
                selectAllRowsItem: false,
                selectAllRowsItemText: 'Todos',
              }}
              progressComponent={<Loader title='Carregando webhooks...' />}
              noDataComponent={<NoDataComponentContent />}
              columns={columns({ setBody, setModalBody })}
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
                          : 'Todos que sou produtor'}
                      </td>
                      <td style={{ maxWidth: '350px' }}>{item.url}</td>
                      <td className='d-flex justify-content-center'>
                        <div className='mr-1'>
                          <ButtonDS
                            size='icon'
                            variant='success'
                            onClick={async () => {
                              setItemHistory(item);
                            }}
                          >
                            <i className='fa fa-history'></i>
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
                      Nada registrado ainda.
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
