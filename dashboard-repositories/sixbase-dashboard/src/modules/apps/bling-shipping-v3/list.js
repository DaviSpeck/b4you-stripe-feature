import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Table } from 'react-bootstrap';
import logoBling from '../../../images/apps/bling-shipping-v3.png';
import PageTitle from '../../../jsx/layouts/PageTitle';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import ModalCredential from './modal-credential';
import ModalNf from './modal-nf';
import ModalProblems from './modal-problems';
import api from '../../../providers/api';
import { notify } from '../../functions';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import { useLocation } from 'react-router-dom';

const PageAppsListBling = () => {
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
  const [showModalNfe, setShowModalNfe] = useState(false);
  const [showModalProblems, setShowModalProblems] = useState(false);

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
      .delete(`/integrations/bling-shipping-v3/`)
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
      .get('/integrations/bling-shipping-v3')
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
      .post(`/integrations/bling-shipping-v3/code/${code}`)
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
        title='Bling Pedidos de Venda - v.3.0'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Bling Pedidos de Venda - v.3.0' },
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

      <ModalGeneric
        show={showModalNfe}
        setShow={setShowModalNfe}
        title={'Configurações de Nota Fiscal'}
        centered
      >
        <ModalNf
          setShow={setShowModalNfe}
          fetchData={fetchData}
          activeCredential={activeCredential}
          setActiveCredential={setActiveCredential}
        />
      </ModalGeneric>

      <ModalGeneric
        show={showModalProblems}
        setShow={setShowModalProblems}
        title={'Pedidos com falha na integração'}
        centered
        size='xl'
      >
        <ModalProblems setShow={setShowModalProblems} />
      </ModalGeneric>

      <section id='page-apps'>
        <img src={logoBling} className='logo-app' alt='Bling' />

        <Card className='mt-4'>
          <Card.Body>
            <div className='d-flex justify-content-end mb-3'>
              <ButtonDS size='sm' onClick={() => setShowModalProblems(true)}>
                Pedidos com falha na integração
              </ButtonDS>
            </div>
            <Table responsive>
              <thead>
                <tr>
                  <th width='100' className='text-center'>
                    Status
                  </th>
                  <th width='100' className='text-center'>
                    Natureza Operação
                  </th>
                  <th width='100' className='text-center'>
                    Transportadora
                  </th>
                  <th width='100' className='text-center'>
                    Serviço
                  </th>
                  <th width='100' className='text-center'>
                    Nota Fiscal
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

                        <td>{item.nat_operacao}</td>
                        <td>{item.shipping}</td>
                        <td>{item.shipping_service}</td>
                        <td>
                          {item.issue_invoice === 0
                            ? 'Desativado'
                            : item.issue_invoice === 1
                            ? 'Após Garantia'
                            : item.issue_invoice === 2
                            ? 'Pagam. Aprov.'
                            : 'Não definido'}
                        </td>

                        <td className='text-center'>
                          <div
                            className='d-flex justify-content-center align-items-center'
                            style={{ gap: '4px' }}
                          >
                            <ButtonDS
                              size='icon'
                              onClick={() => {
                                setActiveCredential(item);
                                setShowModalNfe(!showModalNfe);
                              }}
                            >
                              <i className='bx bxs-cog'></i>
                            </ButtonDS>
                            <ButtonDS
                              size='icon'
                              variant='danger'
                              onClick={() => {
                                setModalCancelShow(true);
                              }}
                            >
                              <i className='bx bx-trash-alt'></i>
                            </ButtonDS>
                          </div>
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

export default PageAppsListBling;
