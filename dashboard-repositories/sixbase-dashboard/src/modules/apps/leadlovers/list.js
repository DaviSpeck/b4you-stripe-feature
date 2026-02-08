import { useEffect, useState } from 'react';
import { Card, Table } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import logoLeadlovers from '../../../images/apps/leadlovers.png';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import PageTitle from '../../../jsx/layouts/PageTitle';
import api from '../../../providers/api';
import NewCredential from './modal-credential';
import { notify } from '../../functions';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const PageAppsListLeadlovers = () => {
  const [showModal, setShowModal] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const history = useHistory();
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [itemCancel, setItemCancel] = useState(null);

  const fetchData = () => {
    api
      .get('/integrations/leadlovers')
      .then((response) => {
        setCredentials(response.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item) => {
    history.push(`/apps/leadlovers/${item.uuid}`);
  };

  const handleDelete = () => {
    api
      .delete(`/integrations/leadlovers/${itemCancel.uuid}`)
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

  return (
    <>
      <PageTitle
        title='Leadlovers'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Leadlovers' },
        ]}
      />
      <ModalGeneric
        show={showModal}
        setShow={setShowModal}
        title='Nova Credencial'
        centered
      >
        <NewCredential setShow={setShowModal} fetchData={fetchData} />
      </ModalGeneric>
      <section id='page-apps'>
        <img src={logoLeadlovers} className='logo-app' alt='' />

        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Integração</th>
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
                        <span className='link-label'>{item.name}</span>
                      </td>
                      <td className='d-flex justify-content-center'>
                        <div className='mr-1'>
                          <ButtonDS
                            size='icon'
                            onClick={() => {
                              handleEdit(item);
                            }}
                            className='btn btn-primary shadow btn-xs sharp mr-1'
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

export default PageAppsListLeadlovers;
