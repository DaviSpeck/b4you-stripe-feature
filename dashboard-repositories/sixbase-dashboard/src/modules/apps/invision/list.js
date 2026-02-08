import { useEffect, useState } from 'react';
import { Card, Col, Form, Row, Table } from 'react-bootstrap';
import logoInvision from '../../../images/apps/invision.png';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import PageTitle from '../../../jsx/layouts/PageTitle';
import api from '../../../providers/api';
import { notify } from '../../functions';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const PageAppsListInvision = () => {
  const [showModal, setShowModal] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [itemCancel, setItemCancel] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const history = useHistory();

  const { register, handleSubmit, errors, formState } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;

  const fetchData = () => {
    api
      .get('/integrations/invision')
      .then((response) => {
        setCredentials(response.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = () => {
    api
      .delete(`/integrations/invision/${itemCancel.uuid}`)
      .then(() => {
        fetchData();
        setModalCancelShow(false);
        notify({
          message: 'Credencial removida com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao remover a credencial',
          type: 'error',
        });
      });
  };
  const onSubmit = (data) => {
    setRequesting(true);

    api
      .post('/integrations/invision', data)
      .then(() => {
        fetchData();
        setShowModal(false);
        notify({
          message: 'Credencial criada com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao criar credencial',
          type: 'error',
        });
      })
      .finally(() => setRequesting(false));
  };
  const handleEdit = (item) => {
    history.push(`/apps/invision/${item.uuid}`);
  };

  return (
    <>
      <PageTitle
        title='Invision'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Invision' },
        ]}
      />
      <ModalGeneric
        show={showModal}
        setShow={setShowModal}
        title='Nova Credencial'
        centered
      >
        <Row>
          <Col xs={12}>
            <Form.Group>
              <label htmlFor=''>API Key *</label>
              <Form.Control
                ref={register({ required: true })}
                name='api_key'
                isInvalid={errors.api_key}
              />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <label htmlFor=''>API URL *</label>
              <Form.Control
                ref={register({ required: true })}
                name='api_url'
                isInvalid={errors.api_url}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col className='d-flex justify-content-end'>
            <ButtonDS
              size={'sm'}
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || requesting}
            >
              {!requesting ? 'Salvar' : 'salvando...'}
            </ButtonDS>
          </Col>
        </Row>
      </ModalGeneric>
      <section id='page-apps'>
        <img src={logoInvision} className='logo-app' alt='' />

        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>URL</th>
                  <th width='100'>Ações</th>
                </tr>
              </thead>
              <tbody>
                {credentials.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td
                        onClick={() => {
                          handleEdit(item);
                        }}
                      >
                        <span className='link-label'>{item.api_key}</span>
                      </td>
                      <td
                        onClick={() => {
                          handleEdit(item);
                        }}
                      >
                        <span className='link-label'>{item.api_url}</span>
                      </td>
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
                {credentials.length === 0 && (
                  <tr>
                    <td colSpan='100' className='text-center'>
                      Não há integrações cadastradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
        {credentials.length === 0 && (
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
        )}
        {modalCancelShow && (
          <ConfirmAction
            title={'Remover Integração'}
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

export default PageAppsListInvision;
