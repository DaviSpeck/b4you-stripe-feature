import { useEffect, useState } from 'react';
import { Card, Spinner, Table } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import PageTitle from '../../../jsx/layouts/PageTitle';
import api from '../../../providers/api';
import { notify } from '../../functions';
import ModalCredential from './modal-credential';

const PageAppsListOmie = () => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [integration, setIntegration] = useState(null);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);

  const history = useHistory();

  const fetchData = () => {
    setLoading(true);

    api
      .get('/integrations/omie')
      .then((response) => {
        // Since we only allow one integration, we get the first (and only) one
        setIntegration(response.data.length > 0 ? response.data[0] : null);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = () => {
    if (integration) {
      setEditingIntegration(integration);
      setShowModal(true);
    }
  };

  const handleCreate = () => {
    setEditingIntegration(null);
    setShowModal(true);
  };

  const handleDelete = () => {
    api
      .delete(`/integrations/omie`)
      .then(() => {
        setIntegration(null);
        setModalCancelShow(false);
        notify({
          message: 'Integração removida com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao remover a integração',
          type: 'error',
        });
      });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingIntegration(null);
  };

  return (
    <>
      <ModalGeneric
        show={showModal}
        setShow={setShowModal}
        title={editingIntegration ? 'Editar Integração' : 'Nova Integração'}
        centered
      >
        <ModalCredential
          setShow={setShowModal}
          fetchData={fetchData}
          editingIntegration={editingIntegration}
          onClose={handleModalClose}
        />
      </ModalGeneric>

      <PageTitle
        title='Omie'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Omie' },
        ]}
      />

      <section id='page-apps'>
        <div className='logo-app'>
          <h2>Omie</h2>
          <p>Sistema de gestão empresarial</p>
        </div>

        <Card className='mt-4'>
          <Card.Body>
            {loading ? (
              <div
                className='d-flex justify-content-center align-items-center'
                style={{ height: '200px' }}
              >
                <Spinner animation='border' />
                <span className='ml-2'>Carregando dados do Omie...</span>
              </div>
            ) : integration ? (
              <Table responsive>
                <thead>
                  <tr>
                    <th>Integração</th>
                    <th>App Key</th>
                    <th>App Secret</th>
                    <th width='100'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td onClick={handleEdit}>
                      <span className='link-label'>{integration.name}</span>
                    </td>
                    <td>{integration.app_key || '-'}</td>
                    <td>{integration.app_secret ? '••••••••••••••••' : '-'}</td>
                    <td className='d-flex justify-content-center'>
                      <div className='mr-1'>
                        <ButtonDS
                          size='icon'
                          onClick={handleEdit}
                          className='btn btn-primary shadow btn-xs sharp mr-1'
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
                </tbody>
              </Table>
            ) : (
              <div className='text-center py-5'>
                <div className='mb-4'>
                  <i
                    className='bx bx-cog'
                    style={{ fontSize: '3rem', color: '#6c757d' }}
                  ></i>
                </div>
                <h5 className='mb-3'>Integração Omie</h5>
                <p className='mb-4 text-muted'>
                  Configure a integração com o sistema Omie para sincronizar
                  dados.
                </p>
                <p className='mb-4'>Nenhuma integração configurada.</p>
                <ButtonDS size='sm' onClick={handleCreate}>
                  Configurar Integração
                </ButtonDS>
              </div>
            )}
          </Card.Body>
        </Card>

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

export default PageAppsListOmie;
