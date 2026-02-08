import PageTitle from '../../../jsx/layouts/PageTitle';
import logoAstron from '../../../images/apps/astron.svg';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import { useEffect, useState } from 'react';
import api from '../../../providers/api';
import { Card, Table } from 'react-bootstrap';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import { notify } from '../../functions';
import NewCredential from './modal-credential';
import { useHistory } from 'react-router-dom';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const PageAppsListAstronmembers = () => {
  const [showModal, setShowModal] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [itemCancel, setItemCancel] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const history = useHistory();

  const handleEdit = (item) => {
    history.push(`/apps/astronmembers/${item.uuid}`);
  };

  const fetchData = () => {
    setRequesting(true);
    api
      .get('/integrations/astronmembers')
      .then((response) => {
        setCredentials(response.data);
      })
      .catch(() => {})
      .finally(() => setRequesting(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = () => {
    setRequesting(true);
    api
      .delete(`/integrations/astronmembers/${itemCancel.uuid}`)
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

  return (
    <>
      <PageTitle
        title='Astron Members'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Astron Members' },
        ]}
      />
      <section id='page-apps'>
        <img src={logoAstron} className='logo-app' alt='' />

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
                        <span className='link-label'>{item.name}</span>
                      </td>
                      <td>
                        <span>{item.api_url_lead}</span>
                      </td>
                      <td className='d-flex justify-content-center'>
                        <div className={'mr-1'}>
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

export default PageAppsListAstronmembers;
