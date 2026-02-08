import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Table } from 'react-bootstrap';
import logoMelhorEnvio from '../../../images/apps/melhor-envio.png';
import PageTitle from '../../../jsx/layouts/PageTitle';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import ModalCredential from './modal-credential';
import api from '../../../providers/api';
import { notify } from '../../functions';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import { useLocation } from 'react-router-dom';

const PageAppsMelhorEnvio = () => {
  const { reset } = useForm({
    mode: 'onChange',
  });
  const location = useLocation();
  const [code, setCode] = useState();
  const [requesting, setRequesting] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [activeCredential, setActiveCredential] = useState(null);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setCode(codeParam);
    }
  }, [location.search]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (code) fetchCode();
  }, [code]);

  const handleDelete = () => {
    setRequesting(true);
    api
      .delete(`/integrations/melhor-envio/`)
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
      })
      .finally(() => setRequesting(false));
  };

  const fetchData = () => {
    setRequesting(true);
    api
      .get('/integrations/melhor-envio')
      .then((response) => {
        setCredentials(response.data);
        reset(response.data.settings);
      })
      .catch(() => {})
      .finally(() => {
        setRequesting(false);
      });
  };

  const fetchCode = () => {
    setRequesting(true);
    api
      .post(`/integrations/melhor-envio/code/${code}`)
      .then(() => {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        fetchData();
      })
      .catch(() => {})
      .finally(() => {
        setRequesting(false);
      });
  };

  return (
    <>
      <PageTitle
        title='Melhor Envio'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Melhor Envio' },
        ]}
      />
      <ModalGeneric
        show={showModal}
        setShow={setShowModal}
        title={
          credentials.length === 0 ? 'Nova Credencial' : 'Editar Credencial'
        }
        centered
      >
        <ModalCredential
          setShow={setShowModal}
          fetchData={fetchData}
          activeCredential={activeCredential}
          setActiveCredential={setActiveCredential}
        />
      </ModalGeneric>

      <section id='page-apps'>
        <img src={logoMelhorEnvio} className='logo-app' alt='Melhor Envio' />
        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th width='100' className='text-center'>
                    Status
                  </th>
                  <th width='100' className='text-center'>
                    Nome
                  </th>
                  <th width='100' className='text-center'>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {!requesting &&
                  credentials.map((item, index) => {
                    return (
                      <tr className='text-center' key={index}>
                        <td className='d-flex justify-content-center'>
                          <div>
                            {item.active ? (
                              <ButtonDS size='icon' variant='success'>
                                <i
                                  className='bx bx-check'
                                  style={{ fontSize: 22 }}
                                ></i>
                              </ButtonDS>
                            ) : (
                              <ButtonDS size='icon' variant='danger'>
                                <i
                                  className='bx bx-error'
                                  style={{ fontSize: 20 }}
                                ></i>
                              </ButtonDS>
                            )}
                          </div>
                        </td>

                        <td>{item.name}</td>
                        <td className='d-flex justify-content-center'>
                          <ButtonDS
                            size='icon'
                            variant='danger'
                            onClick={() => {
                              setModalCancelShow(true);
                            }}
                          >
                            <i className='bx bx-trash-alt'></i>
                          </ButtonDS>
                        </td>
                      </tr>
                    );
                  })}
                {credentials.length === 0 && !requesting && (
                  <tr>
                    <td colSpan='100' className='text-center'>
                      Não há integrações cadastradas.
                    </td>
                  </tr>
                )}
                {requesting && (
                  <tr>
                    <td colSpan='100' className='text-center'>
                      <i
                        className='bx bx-loader-alt bx-spin'
                        style={{ fontSize: 40 }}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
        <div className='mt-4'>
          {credentials.length === 0 && (
            <ButtonDS
              size='sm'
              onClick={() => {
                setShowModal(true);
              }}
            >
              Nova Integração
            </ButtonDS>
          )}
        </div>
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

export default PageAppsMelhorEnvio;
