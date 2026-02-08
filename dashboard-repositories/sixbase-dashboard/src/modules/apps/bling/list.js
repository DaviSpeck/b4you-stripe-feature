import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Table } from 'react-bootstrap';
import logoBling from '../../../images/apps/bling.png';
import PageTitle from '../../../jsx/layouts/PageTitle';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import ModalCredential from './modal-credential';
import api from '../../../providers/api';
import { notify } from '../../functions';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const PageAppsListBling = () => {
  const { reset } = useForm({
    mode: 'onChange',
  });
  const [showModal, setShowModal] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [activeCredential, setActiveCredential] = useState(null);
  const [modalCancelShow, setModalCancelShow] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item) => {
    setActiveCredential(item);
    setShowModal(true);
  };

  const handleDelete = () => {
    setRequesting(true);
    api
      .delete(`/integrations/bling/`)
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
      .get('/integrations/bling')
      .then((response) => {
        setCredentials(response.data);
        reset(response.data.settings);
      })
      .catch(() => {})
      .finally(() => {
        setRequesting(false);
      });
  };

  return (
    <>
      <PageTitle
        title='Bling Notas Fiscais'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Bling Notas Fiscais' },
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
        <img src={logoBling} className='logo-app' alt='' />

        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th width='100' className='text-center'>
                    Status
                  </th>
                  <th>API Key</th>
                  <th width='100' className='text-center'>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {!requesting &&
                  credentials.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td className='d-flex justify-content-center'>
                          <div>
                            {item.verified ? (
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
                        <td
                          onClick={() => {
                            handleEdit(item);
                          }}
                        >
                          <span className='link-label'>{item.api_key}</span>
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
                              setModalCancelShow(true);
                            }}
                          >
                            <i className='bx bx-trash-alt'></i>
                          </ButtonDS>
                        </td>
                      </tr>
                    );
                  })}
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
