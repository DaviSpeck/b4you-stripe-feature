import { useEffect, useState } from 'react';
import { Card, Table } from 'react-bootstrap';
import logoZoppy from '../../../images/apps/zoppy.png';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import PageTitle from '../../../jsx/layouts/PageTitle';
import api from '../../../providers/api';
import Loader from '../../../utils/loader';
import { notify } from '../../functions';
import ModalRule from './modal-rule';

const PageAppsZoppy = () => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [item, setItem] = useState(null);

  const handleShowModal = (value, clearEdit = false) => {
    if (clearEdit) setItem(null);
    setShowModal(value);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data } = await api.get('/integrations/zoppy');
      setData(data.integration);
    } catch (error) {
      notify({
        message: 'Ocorreu um erro ao buscar os dados, tente novamente.',
        type: 'error',
      });

      return error;
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setItem(item);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/integrations/zoppy/${item.id}`);

      notify({
        message: 'Integração removida com sucesso',
        type: 'success',
      });

      await fetchData();

      setModalCancelShow(false);
      setItem(null);
    } catch (error) {
      notify({
        message: 'Ocorreu um erro ao remover a integração, tente novamente.',
        type: 'error',
      });

      return error;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));

    notify({
      message: 'Copiado para a área de transferência',
      type: 'success',
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <PageTitle
        title='Zoppy'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Zoppy' },
        ]}
      />

      <section id='page-apps'>
        <img src={logoZoppy} className='logo-app' alt='Zoppy' />

        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th width='130'>Status</th>
                  <th>API Key</th>
                  <th width='130' className='text-center'>
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan='100' className='text-center'>
                      <Loader title='Carregando dados...' />
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((item) => {
                    return (
                      <tr key={`zoppy_${item.id}`}>
                        <td className='text-center'>
                          {item.status === 'Inativo' ? (
                            <ButtonDS size='icon' variant='danger'>
                              <i
                                className='bx bx-error'
                                style={{ fontSize: 20 }}
                              ></i>
                            </ButtonDS>
                          ) : (
                            <ButtonDS size='icon' variant='success'>
                              <i
                                className='bx bx-check'
                                style={{ fontSize: 22 }}
                              ></i>
                            </ButtonDS>
                          )}
                        </td>

                        <td className='api-key'>{item.apiKey}</td>

                        <td className='d-flex justify-content-center'>
                          <div className='mr-1'>
                            <ButtonDS
                              size='icon'
                              onClick={() => {
                                copyToClipboard(item.apiKey);
                              }}
                            >
                              <i className='bx bx-copy'></i>
                            </ButtonDS>
                          </div>

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
                              setItem(item);
                              setModalCancelShow(true);
                            }}
                          >
                            <i className='bx bx-trash-alt'></i>
                          </ButtonDS>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan='100' className='text-center'>
                      Nada registrado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {data.length === 0 && (
          <div className='mt-4'>
            <ButtonDS
              size='sm'
              onClick={() => {
                setShowModal(true);
              }}
              disabled={loading}
            >
              Nova Integração
            </ButtonDS>
          </div>
        )}

        <ModalGeneric
          show={showModal}
          setShow={
            item
              ? (value) => handleShowModal(value, true)
              : (value) => handleShowModal(value)
          }
          title={item ? 'Editar Integração' : 'Nova Integração'}
          centered
        >
          <ModalRule
            setShow={handleShowModal}
            fetchData={fetchData}
            apiData={item}
          />
        </ModalGeneric>

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

export default PageAppsZoppy;
