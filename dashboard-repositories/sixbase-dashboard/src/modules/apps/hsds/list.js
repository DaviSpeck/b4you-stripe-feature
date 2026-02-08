import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Card, Spinner, Table } from 'react-bootstrap';
import logoHSDS from '../../../images/apps/hsds.png';
import PageTitle from '../../../jsx/layouts/PageTitle';
import api from '../../../providers/api';
import { notify } from '../../functions';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const PageAppsHSDS = () => {
  useForm({
    mode: 'onChange',
  });
  const [showModal, setShowModal] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [credentials, setCredentials] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    api
      .get('integrations/hsds')
      .then((r) => {
        setCredentials(r.data);
      })
      .catch((err) => {
        // eslint-disable-next-line
        console.log(err);
      })
      .finally(() => setRequesting(false));
  };

  const handleDelete = () => {
    setRequesting(true);
    api
      .delete('integrations/hsds')
      .then((r) => {
        fetchData();
        setCredentials(r.data);
        notify({
          message: 'Credencial removida com sucesso',
          type: 'success',
        });
      })
      .catch((err) => {
        notify({ message: 'Falha ao remover credencial', type: 'error' });
        // eslint-disable-next-line
        console.log(err);
      })
      .finally(() => setRequesting(false));
  };

  const confirmAction = () => {
    api
      .post('integrations/hsds')
      .then((r) => {
        fetchData();
        setCredentials(r.data);
        setShowModal(false);
        notify({
          message: 'Credencial cadastrada com sucesso',
          type: 'success',
        });
      })
      .catch((err) => {
        notify({ message: 'Falha ao cadastrar credencial', type: 'error' });
        // eslint-disable-next-line
        console.log(err);
      })
      .finally(() => setRequesting(false));
  };

  const copyToClipboard = (element, param, text = 'Copiado com sucesso') => {
    element.select();
    navigator.clipboard.writeText(param);
    notify({
      message: text,
      type: 'success',
    });
    setTimeout(() => {}, 3000);
  };

  return (
    <>
      <PageTitle
        title='HSDS'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'HSDS' },
        ]}
      />
      <ConfirmAction
        title={'Criar credencial'}
        show={showModal}
        setShow={setShowModal}
        handleAction={confirmAction}
        buttonText={'Gerar chave'}
        variant={'warning'}
        variantButton={'warning'}
        textAlert={'Você deseja gerar uma chave de API?'}
        haveLoader={false}
        simpleConfirm
        centered
      />
      <section id='page-apps'>
        <img src={logoHSDS} className='logo-app' alt='' />

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
                  credentials.length > 0 &&
                  credentials.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td className='d-flex justify-content-center'>
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
                        <td>
                          <div className='d-flex'>
                            <textarea
                              id='pix-code'
                              className='form-control pix-code'
                              defaultValue={item.api_key}
                              onClick={(e) => {
                                e.preventDefault();
                                copyToClipboard(
                                  e.currentTarget,
                                  item.api_key,
                                  'Copiado com sucesso'
                                );
                              }}
                              readOnly
                              style={{
                                height: '35px',
                                borderRadius: '8px 0px 0px 8px',
                              }}
                            />
                            <Button
                              variant={'primary'}
                              onClick={(e) => {
                                e.preventDefault();
                                const textarea =
                                  e.currentTarget.parentElement.firstChild;
                                copyToClipboard(
                                  textarea,
                                  item.api_key,
                                  'Copiado com sucesso'
                                );
                              }}
                              className='d-flex align-items-center'
                              style={{
                                borderRadius: '0px 8px 8px 0px',
                                height: '35px',
                              }}
                            >
                              <i
                                className='bx bx-copy-alt'
                                style={{ fontSize: 21 }}
                              ></i>
                            </Button>
                          </div>
                        </td>

                        <td className='d-flex justify-content-center'>
                          <ButtonDS
                            size='icon'
                            variant='danger'
                            onClick={handleDelete}
                          >
                            {requesting ? (
                              <Spinner />
                            ) : (
                              <i className='bx bx-trash-alt'></i>
                            )}
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
      </section>
    </>
  );
};

export default PageAppsHSDS;
