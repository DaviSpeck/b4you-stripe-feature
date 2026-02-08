import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Table } from 'react-bootstrap';
import logoNotazz from '../../../images/apps/notazz.png';
import PageTitle from '../../../jsx/layouts/PageTitle';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import ModalCredential from './modal-credential';
import api from '../../../providers/api';
import { notify } from '../../functions';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import moment from 'moment';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import BadgeDS from '../../../jsx/components/design-system/BadgeDS';

const PageAppsListNotazz = () => {
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
    if (activeCredential) {
      api
        .delete(`/integrations/notazz/${activeCredential.uuid}`)
        .then(() => {
          fetchData();
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
        .finally(() => {
          setModalCancelShow(false);
        });
    }
  };

  const fetchData = () => {
    api
      .get('/integrations/notazz')
      .then((response) => {
        setCredentials(response.data);
        reset(response.data.settings);
      })
      .catch(() => {});
  };

  return (
    <>
      <PageTitle
        title='Notazz'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Notazz' },
        ]}
      />
      <ModalGeneric
        show={showModal}
        setShow={setShowModal}
        size='lg'
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
        <img src={logoNotazz} className='logo-app' alt='' />

        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Data Início</th>
                  <th>Situação</th>
                  <th className='text-center'>Ações</th>
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
                        <span className='link-label'>{item.settings.name}</span>
                      </td>
                      <td
                        style={{
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        onClick={() => {
                          handleEdit(item);
                        }}
                      >
                        <span className='link-label'>
                          {item && item.product && item.product.name
                            ? item.product.name
                            : 'Todos'}
                        </span>
                      </td>
                      <td
                        onClick={() => {
                          handleEdit(item);
                        }}
                      >
                        <span className='link-label'>
                          {!item.id_product
                            ? 'Global'
                            : item.is_affiliate
                            ? 'Afiliado'
                            : item.is_supplier
                            ? 'Fornecedor'
                            : 'Produtor'}
                        </span>
                      </td>
                      <td
                        style={{
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        onClick={() => {
                          handleEdit(item);
                        }}
                      >
                        <span className='link-label'>
                          {item.settings.type === 'product'
                            ? 'Produto'
                            : 'Serviço'}
                        </span>
                      </td>
                      <td
                        onClick={() => {
                          handleEdit(item);
                        }}
                      >
                        <div className='link-label'>
                          {!item.id_product
                            ? '-'
                            : item.start_date
                            ? moment(item.start_date)
                                .add('h', 3)
                                .format('DD/MM/YYYY')
                            : `Não definido`}
                        </div>
                      </td>
                      <td
                        onClick={() => {
                          handleEdit(item);
                        }}
                      >
                        <div className='link-label'>
                          {item.active === true ? (
                            <BadgeDS variant='success'>Ativo</BadgeDS>
                          ) : (
                            <BadgeDS variant='light'>Inativo</BadgeDS>
                          )}
                        </div>
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
                            setActiveCredential(item);
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

export default PageAppsListNotazz;
