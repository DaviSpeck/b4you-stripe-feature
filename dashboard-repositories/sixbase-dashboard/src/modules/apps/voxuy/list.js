import PageTitle from '../../../jsx/layouts/PageTitle';
import logoVoxuy from '../../../images/apps/voxuy.png';
import api from '../../../providers/api';
import { useEffect, useState } from 'react';
import { Card, Table } from 'react-bootstrap';
import { notify } from '../../functions';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import NewCredential from './modal-credential';
import { useHistory } from 'react-router-dom';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const PageAppsListVoxuy = () => {
  const [credentials, setCredentials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalWarning, setShowModalWarning] = useState(true);
  const [itemCancel, setItemCancel] = useState(null);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const history = useHistory();

  const handleEdit = (item) => {
    history.push(`/apps/voxuy/${item.uuid}`);
  };

  const fetchData = () => {
    api
      .get('/integrations/voxuy')
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
      .delete(`/integrations/voxuy/${itemCancel.uuid}`)
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
        title='Voxuy'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Voxuy' },
        ]}
      />
      <section id='page-apps'>
        <img src={logoVoxuy} className='logo-app' alt='' />

        <ModalGeneric
          show={showModal}
          setShow={setShowModal}
          title='Nova Integração'
          centered
        >
          <NewCredential setShow={setShowModal} fetchData={fetchData} />
        </ModalGeneric>

        <ModalGeneric
          show={showModalWarning}
          setShow={setShowModalWarning}
          title='Novidades para você!'
          centered
        >
          <p>
            Estamos finalizando a integração com a API oficial da Voxuy.
            Enquanto isso, conseguimos um cupom de desconto para que todos os
            usuários da B4You utilizem a integração diretamente na plataforma.
            Entre em contato com o nosso suporte para solicitar o seu cupom e
            outras informações.
          </p>
        </ModalGeneric>

        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Integração</th>
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

export default PageAppsListVoxuy;
