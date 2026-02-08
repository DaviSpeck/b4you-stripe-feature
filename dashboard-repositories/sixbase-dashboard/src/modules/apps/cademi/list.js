import PageTitle from '../../../jsx/layouts/PageTitle';
import logoCademi from '../../../images/apps/cademi.png';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import { useEffect, useState } from 'react';
import api from '../../../providers/api';
import { Card, Table } from 'react-bootstrap';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import { notify } from '../../functions';
import NewCredential from './modal-credential';
import { useHistory } from 'react-router-dom';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const PageAppsListCademi = () => {
  const [showModal, setShowModal] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [itemCancel, setItemCancel] = useState(null);
  const history = useHistory();

  const handleEdit = (item) => {
    history.push(`/apps/cademi/${item.uuid}`);
  };

  const fetchData = () => {
    api
      .get('/integrations/cademi')
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
      .delete(`/integrations/cademi/${itemCancel.uuid}`)
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
        title='Cademi'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Cademi' },
        ]}
      />
      <section id='page-apps'>
        <img src={logoCademi} className='logo-app' alt='' />

        <ModalGeneric
          show={showModal}
          setShow={setShowModal}
          title='Nova Integração'
          centered
        >
          <NewCredential setShow={setShowModal} fetchData={fetchData} />
        </ModalGeneric>

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
export default PageAppsListCademi;
