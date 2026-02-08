import { useEffect, useState } from 'react';
import { Card, Col, Table, Button, Row, Alert } from 'react-bootstrap';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import PageTitle from '../../../jsx/layouts/PageTitle';
import api from '../../../providers/api';
import ModalRule from './modal-rule';
import { notify } from '../../functions';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import logoArco from '../../../images/apps/arco.png';

const PageArco = () => {
  const [showModal, setShowModal] = useState(false);
  const [webhooks, setWebhooks] = useState([]);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [itemCancel, setItemCancel] = useState(null);
  const [itemEdit, setItemEdit] = useState(null);
  const [body, setBody] = useState({});
  const [showBody, setModalBody] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchData = () => {
    api
      .get('/integrations/webhooks?id_type=3')
      .then((response) => {
        const { data } = response;
        setWebhooks(data.rows);
      })
      .catch(() => {});
  };

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
        title='Arco'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Arco' },
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

      <section id='page-apps'>
        <img src={logoArco} className='logo-app' alt='' />
        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Produto(s)</th>
                  <th>Tipo</th>
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
                          ? 'Todos que sou Fornecedor'
                          : 'Todos que sou produtor'}
                      </td>
                      <td>
                        {item.is_affiliate
                          ? 'Afiliado'
                          : item.is_supplier
                          ? 'Fornecedor'
                          : 'Produtor'}
                      </td>
                      <td style={{ maxWidth: '350px' }}>{item.url}</td>
                      <td className='d-flex justify-content-center'>
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

export default PageArco;
