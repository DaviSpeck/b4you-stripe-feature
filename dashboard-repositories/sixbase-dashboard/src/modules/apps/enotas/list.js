import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Table } from 'react-bootstrap';
import logoEnotas from '../../../images/apps/enotas.png';
import PageTitle from '../../../jsx/layouts/PageTitle';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import ModalCredential from './modal-credential';
import api from '../../../providers/api';
import { notify } from '../../functions';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const PageAppsListEnotas = () => {
  const { reset } = useForm({
    mode: 'onChange',
  });

  const [showModal, setShowModal] = useState(false);
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
    api
      .delete(`/integrations/enotas/`)
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

  const fetchData = () => {
    api
      .get('/integrations/enotas')
      .then((response) => {
        setCredentials(response.data);
        reset(response.data.settings);
      })
      .catch(() => {});
  };

  return (
    <>
      <PageTitle
        title='Enotas'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Enotas' },
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
        <img src={logoEnotas} className='logo-app' alt='' />

        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>API Key</th>
                  <th width='100' className='text-center'>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {credentials.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td
                        onClick={() => {
                          handleEdit(item.settings);
                        }}
                      >
                        <span className='link-label'>
                          {item.settings.api_key}
                        </span>
                      </td>
                      <td className='d-flex justify-content-center'>
                        <div className='mr-1'>
                          <ButtonDS
                            size='icon'
                            onClick={() => {
                              handleEdit(item.settings);
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

export default PageAppsListEnotas;
