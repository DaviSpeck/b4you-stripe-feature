import { useEffect, useState, useMemo } from 'react';
import { Card, Col, Row, Modal, Form } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import moment from 'moment';
import { PatternFormat } from 'react-number-format';
import api from '../../providers/api';
import { notify } from '../functions';
import Loader from '../../utils/loader';
import NoDataComponentContent from '../NoDataComponentContent';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import ConfirmAction from '../../jsx/layouts/ConfirmAction';

const IntegrationNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterType, setFilterType] = useState('all'); // 'all', 'unread', 'read', 'done'
  const [loadingActions, setLoadingActions] = useState({
    markAsRead: null,
    viewSale: null,
  });
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [saleData, setSaleData] = useState(null);
  const [notificationId, setNotificationId] = useState(null);
  const [editType, setEditType] = useState(null);
  const [showResendModal, setShowResendModal] = useState(false);
  const [pendingResendId, setPendingResendId] = useState(null);

  const dddsValidos = [
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '21',
    '22',
    '24',
    '27',
    '28',
    '31',
    '32',
    '33',
    '34',
    '35',
    '37',
    '38',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '47',
    '48',
    '49',
    '51',
    '53',
    '54',
    '55',
    '61',
    '62',
    '63',
    '64',
    '65',
    '66',
    '67',
    '68',
    '69',
    '71',
    '73',
    '74',
    '75',
    '77',
    '79',
    '81',
    '82',
    '83',
    '84',
    '85',
    '86',
    '87',
    '88',
    '89',
    '91',
    '92',
    '93',
    '94',
    '95',
    '96',
    '97',
    '98',
    '99',
  ];

  const integrationTypes = {
    1: 'Webhook',
    2: 'Bling',
    3: 'Notazz',
    4: 'Antifraude',
  };

  const resendOrder = async (id) => {
    try {
      await api.post(`/integration-notifications/${id}/action/bling/resend`);
      notify({
        message: 'Pedido reenviado com sucesso',
        type: 'success',
      });
      let read = undefined;
      let done = undefined;

      if (filterType === 'unread') {
        read = false;
      } else if (filterType === 'read') {
        read = true;
      } else if (filterType === 'done') {
        done = true;
      }

      fetchNotifications(currentPage, perPage, read, done);
    } catch (error) {
      notify({
        message: 'Erro ao reenviar pedido',
        type: 'error',
      });
    }
  };

  const handleConfirmResend = async () => {
    if (pendingResendId) {
      await resendOrder(pendingResendId);
      setShowResendModal(false);
      setPendingResendId(null);
    }
  };

  const fetchNotifications = async (
    page = 0,
    size = 10,
    read = undefined,
    done = undefined
  ) => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
      };
      if (read !== undefined) {
        params.read = read;
      }
      if (done !== undefined) {
        params.done = done;
      }

      const response = await api.get('/integration-notifications', { params });
      console.log('lalala', response.data.data);
      setNotifications(response.data.data || []);
      setTotalRows(response.data.count || 0);
    } catch (error) {
      notify({
        message: 'Erro ao carregar notificações',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    setLoadingActions((prev) => ({ ...prev, markAsRead: id }));
    try {
      await api.put(`/integration-notifications/${id}/read`);
      notify({
        message: 'Notificação marcada como lida',
        type: 'success',
      });
      let read = undefined;
      let done = undefined;

      if (filterType === 'unread') {
        read = false;
      } else if (filterType === 'read') {
        read = true;
      } else if (filterType === 'done') {
        done = true;
      }

      fetchNotifications(currentPage, perPage, read, done);
    } catch (error) {
      notify({
        message: 'Erro ao marcar notificação como lida',
        type: 'error',
      });
    } finally {
      setLoadingActions((prev) => ({ ...prev, markAsRead: null }));
    }
  };

  const handleViewSale = async (id) => {
    setLoadingActions((prev) => ({ ...prev, viewSale: id }));
    try {
      const response = await api.get(
        `/integration-notifications/${id}/action/bling`
      );
      const saleItem = response.data.sale_item?.[0];

      if (saleItem?.uuid) {
        window.location.href = `/vendas?uuid=${encodeURIComponent(
          saleItem.uuid
        )}`;
      } else {
        notify({
          message: 'UUID da venda não encontrado',
          type: 'error',
        });
        setLoadingActions((prev) => ({ ...prev, viewSale: null }));
      }
    } catch (error) {
      notify({
        message: 'Erro ao buscar detalhes da venda',
        type: 'error',
      });
      setLoadingActions((prev) => ({ ...prev, viewSale: null }));
    }
  };

  const handleEditCustomer = (row) => {
    if (row.sale) {
      setNotificationId(row.id);
      setSaleData(row.sale);

      const action = row.params?.action || '';
      if (action.includes('Corrija telefone/celular')) {
        setEditType('phone');
      } else if (action.includes('Corrija cep/cidade')) {
        setEditType('address');
      } else {
        setEditType('phone');
      }

      setShowEditCustomerModal(true);
    } else {
      notify({
        message: 'Dados da venda não encontrados',
        type: 'error',
      });
    }
  };

  const shouldShowEditCustomerButton = (row) => {
    return (
      row.id_type === 2 &&
      row.params?.action &&
      (row.params.action.includes('Corrija cep/cidade da venda do cliente') ||
        row.params.action.includes(
          'Corrija telefone/celular da venda do cliente'
        ))
    );
  };

  useEffect(() => {
    let read = undefined;
    let done = undefined;

    if (filterType === 'unread') {
      read = false;
    } else if (filterType === 'read') {
      read = true;
    } else if (filterType === 'done') {
      done = true;
    }

    fetchNotifications(currentPage, perPage, read, done);
  }, [currentPage, perPage, filterType]);

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const handlePerRowsChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(0);
  };

  const EditCustomerModal = () => {
    const [whatsapp, setWhatsapp] = useState('');
    const [city, setCity] = useState('');
    const [requesting, setRequesting] = useState(false);
    const [error, setError] = useState('');

    const handleClose = () => {
      setShowEditCustomerModal(false);
      setSaleData(null);
      setWhatsapp('');
      setCity('');
      setError('');
      setEditType(null);
    };

    const validateDDD = (phone) => {
      if (!phone || phone.length < 2) return false;
      const ddd = phone.substring(0, 2);
      return dddsValidos.includes(ddd);
    };

    const validatePhone = (phone) => {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 11) return false;
      return validateDDD(cleanPhone);
    };

    useEffect(() => {
      if (saleData && editType === 'phone') {
        const currentWhatsapp = saleData.whatsapp || '';
        setWhatsapp(currentWhatsapp.replace(/\D/g, ''));
      } else if (saleData && editType === 'address') {
        const currentCity = saleData.address?.city || '';
        setCity(currentCity);
      }
    }, [saleData, editType]);

    const handleSaveWhatsapp = async () => {
      setError('');
      if (!whatsapp || whatsapp.length === 0) {
        setError('WhatsApp é obrigatório');
        return;
      }

      const cleanPhone = whatsapp.replace(/\D/g, '');

      if (cleanPhone.length !== 11) {
        setError('O WhatsApp deve ter 11 dígitos (DDD + número)');
        return;
      }

      if (!validateDDD(cleanPhone)) {
        setError('DDD inválido. Use um DDD válido do Brasil.');
        return;
      }

      setRequesting(true);
      try {
        const body = {
          whatsapp: cleanPhone,
        };

        await api.put(
          `/integration-notifications/${notificationId}/action/bling`,
          body
        );

        notify({
          message: 'WhatsApp atualizado com sucesso',
          type: 'success',
        });
        handleClose();
        let read = undefined;
        let done = undefined;

        if (filterType === 'unread') {
          read = false;
        } else if (filterType === 'read') {
          read = true;
        } else if (filterType === 'done') {
          done = true;
        }

        fetchNotifications(currentPage, perPage, read, done);

        setPendingResendId(notificationId);
        setShowResendModal(true);
      } catch (error) {
        notify({
          message: 'Erro ao atualizar WhatsApp',
          type: 'error',
        });
      } finally {
        setRequesting(false);
      }
    };

    const handleSaveCity = async () => {
      setError('');
      if (!city || city.trim().length === 0) {
        setError('Cidade é obrigatória');
        return;
      }

      setRequesting(true);
      try {
        const body = {
          address: {
            city: city.trim(),
          },
        };

        await api.put(
          `/integration-notifications/${notificationId}/action/bling`,
          body
        );

        notify({
          message: 'Cidade atualizada com sucesso',
          type: 'success',
        });
        handleClose();
        let read = undefined;
        let done = undefined;

        if (filterType === 'unread') {
          read = false;
        } else if (filterType === 'read') {
          read = true;
        } else if (filterType === 'done') {
          done = true;
        }

        fetchNotifications(currentPage, perPage, read, done);

        setPendingResendId(notificationId);
        setShowResendModal(true);
      } catch (error) {
        notify({
          message: 'Erro ao atualizar cidade',
          type: 'error',
        });
      } finally {
        setRequesting(false);
      }
    };

    return (
      <Modal
        show={showEditCustomerModal}
        onHide={handleClose}
        centered
        size='md'
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editType === 'phone'
              ? 'Corrigir WhatsApp/Celular'
              : editType === 'address'
              ? 'Corrigir Cidade'
              : 'Dados do Comprador'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!saleData ? (
            <div className='text-center p-4'>
              <Loader title='Carregando dados...' />
            </div>
          ) : editType === 'phone' ? (
            <div>
              <Form.Group className='mb-3'>
                <Form.Label>WhatsApp/Celular</Form.Label>
                <PatternFormat
                  value={whatsapp}
                  onValueChange={({ value }) => {
                    setWhatsapp(value);
                    setError('');
                  }}
                  format='(##) #####-####'
                  valueIsNumericString
                  className={`form-control ${error ? 'is-invalid' : ''}`}
                  placeholder='(61) 99640-7520'
                  allowEmptyFormatting
                />
                {error && (
                  <div className='invalid-feedback d-block'>{error}</div>
                )}
                <Form.Text className='text-muted'>
                  Formato: (DDD) 9XXXX-XXXX (exemplo: 61999999999)
                </Form.Text>
              </Form.Group>
            </div>
          ) : editType === 'address' ? (
            <div>
              <div className='alert alert-warning mb-3' role='alert'>
                <strong>Atenção:</strong> A cidade preenchida está incorreta.
              </div>
              <Form.Group className='mb-3'>
                <Form.Label>Cidade Atual</Form.Label>
                <Form.Control
                  type='text'
                  value={saleData.address?.city || 'Não informado'}
                  disabled
                  className='bg-light'
                />
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>Nova Cidade *</Form.Label>
                <Form.Control
                  type='text'
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setError('');
                  }}
                  className={error ? 'is-invalid' : ''}
                  placeholder='Digite o nome correto da cidade'
                />
                {error && (
                  <div className='invalid-feedback d-block'>{error}</div>
                )}
              </Form.Group>
            </div>
          ) : (
            <div>
              <p>
                <strong>WhatsApp:</strong>{' '}
                {saleData.whatsapp || 'Não informado'}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <ButtonDS
            variant='secondary'
            size='sm'
            onClick={handleClose}
            disabled={requesting}
          >
            Cancelar
          </ButtonDS>
          {editType === 'phone' && (
            <ButtonDS
              variant='primary'
              size='sm'
              onClick={handleSaveWhatsapp}
              disabled={requesting || !whatsapp}
            >
              {requesting ? 'Salvando...' : 'Salvar'}
            </ButtonDS>
          )}
          {editType === 'address' && (
            <ButtonDS
              variant='primary'
              size='sm'
              onClick={handleSaveCity}
              disabled={requesting || !city.trim()}
            >
              {requesting ? 'Salvando...' : 'Salvar'}
            </ButtonDS>
          )}
        </Modal.Footer>
      </Modal>
    );
  };

  const columns = useMemo(
    () => [
      {
        name: 'Tipo',
        cell: (row) => (
          <span>{integrationTypes[row.id_type] || `Tipo ${row.id_type}`}</span>
        ),
        width: '120px',
      },
      {
        name: 'Mensagem',
        cell: (row) => (
          <span style={{ wordBreak: 'break-word' }}>
            {row.params?.message || '-'}
          </span>
        ),
        minWidth: '200px',
        wrap: true,
      },
      {
        name: 'Ação',
        cell: (row) => (
          <span style={{ wordBreak: 'break-word' }}>
            {row.params?.action || '-'}
          </span>
        ),
        minWidth: '350px',
      },
      {
        name: 'Status',
        cell: (row) => (
          <BadgeDS variant={row.read ? 'success' : 'danger'} disc>
            {row.read ? 'Lida' : 'Não lida'}
          </BadgeDS>
        ),
        width: '120px',
        center: true,
      },
      {
        name: 'Concluída',
        cell: (row) => {
          let isDone = false;
          if (row.done !== undefined) {
            isDone = row.done;
          } else if (row.data) {
            if (typeof row.data === 'string') {
              try {
                const parsedData = JSON.parse(row.data);
                isDone = parsedData?.done === true;
              } catch (e) {
                isDone = false;
              }
            } else if (row.data.done !== undefined) {
              isDone = row.data.done;
            }
          }

          return (
            <BadgeDS variant={isDone ? 'success' : 'secondary'} disc>
              {isDone ? 'Sim' : 'Não'}
            </BadgeDS>
          );
        },
        width: '120px',
        center: true,
      },
      {
        name: 'Data',
        cell: (row) =>
          row.created_at
            ? moment(row.created_at).format('DD/MM/YYYY HH:mm:ss')
            : '-',
        width: '160px',
        center: true,
      },
      {
        name: 'Ações',
        cell: (row) => {
          const isViewSaleLoading = loadingActions.viewSale === row.id;
          const isMarkAsReadLoading = loadingActions.markAsRead === row.id;
          const showEditCustomerBtn = shouldShowEditCustomerButton(row);

          return (
            <div
              className='d-flex justify-content-center'
              style={{ gap: '8px' }}
            >
              {showEditCustomerBtn && (
                <ButtonDS
                  size='icon'
                  variant='warning'
                  onClick={() => handleEditCustomer(row)}
                  title='Editar dados do comprador'
                  disabled={isViewSaleLoading || isMarkAsReadLoading}
                >
                  <i className='bx bx-edit'></i>
                </ButtonDS>
              )}
              {row.id_type === 2 && (
                <ButtonDS
                  size='icon'
                  variant='success'
                  onClick={() => handleViewSale(row.id)}
                  title='Ver detalhes da venda'
                  disabled={isViewSaleLoading || isMarkAsReadLoading}
                >
                  <i
                    className={`bx ${
                      isViewSaleLoading ? 'bx-loader-alt bx-spin' : 'bx-show'
                    }`}
                  ></i>
                </ButtonDS>
              )}
              {!row.read && (
                <ButtonDS
                  size='icon'
                  variant='primary'
                  onClick={() => markAsRead(row.id)}
                  title='Marcar como lida'
                  disabled={isMarkAsReadLoading || isViewSaleLoading}
                >
                  <i
                    className={`bx ${
                      isMarkAsReadLoading ? 'bx-loader-alt bx-spin' : 'bx-check'
                    }`}
                  ></i>
                </ButtonDS>
              )}
            </div>
          );
        },
        width: '150px',
        center: true,
      },
    ],
    [loadingActions]
  );

  return (
    <>
      <Row className='mb-4'>
        <Col xl={12}>
          <Card>
            <Card.Header
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <div
                className='d-flex'
                style={{
                  gap: '8px',
                }}
              >
                <ButtonDS
                  variant={filterType === 'all' ? 'primary' : 'secondary'}
                  size='sm'
                  onClick={() => setFilterType('all')}
                >
                  Todas
                </ButtonDS>
                <ButtonDS
                  variant={filterType === 'unread' ? 'primary' : 'secondary'}
                  size='sm'
                  onClick={() => setFilterType('unread')}
                >
                  Não lidas
                </ButtonDS>
                <ButtonDS
                  variant={filterType === 'read' ? 'primary' : 'secondary'}
                  size='sm'
                  onClick={() => setFilterType('read')}
                >
                  Lidas
                </ButtonDS>
                <ButtonDS
                  variant={filterType === 'done' ? 'primary' : 'secondary'}
                  size='sm'
                  onClick={() => setFilterType('done')}
                >
                  Concluídas
                </ButtonDS>
              </div>
            </Card.Header>
            <Card.Body>
              <div className='container-datatable'>
                <DataTable
                  columns={columns}
                  data={notifications}
                  striped
                  highlightOnHover
                  progressPending={loading}
                  progressComponent={
                    <Loader title='Carregando notificações...' />
                  }
                  noDataComponent={
                    <NoDataComponentContent text='Sem notificações' />
                  }
                  pagination
                  paginationServer
                  paginationTotalRows={totalRows}
                  paginationPerPage={perPage}
                  paginationRowsPerPageOptions={[10, 20, 50]}
                  onChangePage={handlePageChange}
                  onChangeRowsPerPage={handlePerRowsChange}
                  paginationComponentOptions={{
                    rowsPerPageText: 'Linhas por página',
                    rangeSeparatorText: 'de',
                    selectAllRowsItem: false,
                    selectAllRowsItemText: 'Todos',
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <EditCustomerModal />
      <ConfirmAction
        show={showResendModal}
        setShow={setShowResendModal}
        title='Reenviar Pedido'
        handleAction={handleConfirmResend}
        buttonText='Sim, reenviar'
        simpleConfirm
        centered
        variant='info'
        variantButton='primary'
        textAlert='Deseja reenviar o pedido para o Bling?'
        description='O pedido será reenviado com os dados atualizados.'
        haveLoader={false}
      />
    </>
  );
};

export default IntegrationNotifications;
