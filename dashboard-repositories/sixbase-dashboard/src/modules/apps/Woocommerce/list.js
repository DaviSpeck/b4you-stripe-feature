import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Table } from 'react-bootstrap';
import logoWoocommerce from '../../../images/apps/woocommerce.png';
import PageTitle from '../../../jsx/layouts/PageTitle';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import ModalCredential from './modal-credential';
import api from '../../../providers/api';
import { notify } from '../../functions';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const PageAppsWoocommerce = () => {
  const { reset } = useForm({
    mode: 'onChange',
  });
  const [requesting, setRequesting] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [activeCredential, setActiveCredential] = useState(null);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = () => {
    setRequesting(true);
    api
      .delete(`/integrations/woocommerce/`)
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
      .get('/integrations/woocommerce')
      .then((response) => {
        setCredentials(response.data);
        reset(response.data.settings);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  return (
    <>
      <PageTitle
        title='WooCommerce'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'WooCommerce' },
        ]}
      />
      <ModalGeneric
        show={showModal}
        setShow={setShowModal}
        title={'Nova Credencial'}
        centered
      >
        <ModalCredential setShow={setShowModal} fetchData={fetchData} />
      </ModalGeneric>

      <section id='page-apps'>
        <img src={logoWoocommerce} className='logo-app' alt='WooCommerce' />
        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th width='50' className='text-center'>
                    Status
                  </th>
                  <th width='100' className='text-center'>
                    URL da Loja
                  </th>
                  <th width='100' className='text-center'>
                    Chave do Cliente
                  </th>
                  <th width='100' className='text-center'>
                    Token de Cliente
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
                        <td className='d-flex justify-content-center woocommerce-status-cell'>
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

                        <td>{item.url}</td>
                        <td>{item.consumer_key}</td>
                        <td>{item.consumer_secret}</td>
                        <td className='d-flex justify-content-center woocommerce-action-cell'>
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
          {credentials.length === 0 && !requesting && (
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

export default PageAppsWoocommerce;
