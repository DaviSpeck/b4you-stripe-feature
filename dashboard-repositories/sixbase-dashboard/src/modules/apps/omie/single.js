import { useEffect, useState } from 'react';
import { Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useHistory, useParams } from 'react-router-dom';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import PageTitle from '../../../jsx/layouts/PageTitle';
import api from '../../../providers/api';
import { notify } from '../../functions';

const PageAppsSingleOmie = () => {
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [integration, setIntegration] = useState(null);
  const [formData, setFormData] = useState({
    app_key: '',
    app_secret: '',
    product_code_omie: '',
    payment_code_omie: '',
    category_code_omie: '',
    account_code_omie: '',
    scenario_code_omie: '',
  });

  const { uuid } = useParams();
  const history = useHistory();

  const fetchData = () => {
    setLoading(true);

    api
      .get(`/integrations/omie/${uuid}`)
      .then((response) => {
        setIntegration(response.data);
        // Load form data from the fetched integration
        setFormData({
          app_key: response.data.app_key || '',
          app_secret: response.data.app_secret || '',
          product_code_omie: response.data.product_code_omie || '',
          payment_code_omie: response.data.payment_code_omie || '',
          category_code_omie: response.data.category_code_omie || '',
          account_code_omie: response.data.account_code_omie || '',
          scenario_code_omie: response.data.scenario_code_omie || '',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao carregar dados da integração',
          type: 'error',
        });
        history.push('/apps/omie');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [uuid]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setRequesting(true);

    api
      .put(`/integrations/omie/${uuid}`, formData)
      .then(() => {
        notify({
          message: 'Integração atualizada com sucesso',
          type: 'success',
        });
        fetchData(); // Refetch to get updated data
      })
      .catch(() => {
        notify({
          message: 'Falha ao atualizar integração',
          type: 'error',
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = () => {
    api
      .delete(`/integrations/omie/${uuid}`)
      .then(() => {
        notify({
          message: 'Integração removida com sucesso',
          type: 'success',
        });
        history.push('/apps/omie');
      })
      .catch(() => {
        notify({
          message: 'Falha ao remover integração',
          type: 'error',
        });
      });
  };

  const handleToggleStatus = () => {
    api
      .patch(`/integrations/omie/${uuid}/toggle-status`)
      .then(() => {
        notify({
          message: 'Status alterado com sucesso',
          type: 'success',
        });
        fetchData(); // Refetch to get updated status
      })
      .catch(() => {
        notify({
          message: 'Falha ao alterar status',
          type: 'error',
        });
      });
  };

  const handleTestConnection = () => {
    api
      .post(`/integrations/omie/${uuid}/test`)
      .then(() => {
        notify({
          message: 'Conexão testada com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao testar conexão',
          type: 'error',
        });
      });
  };

  if (loading) {
    return (
      <div
        className='d-flex justify-content-center align-items-center'
        style={{ height: '400px' }}
      >
        <Spinner animation='border' />
        <span className='ml-2'>Carregando integração...</span>
      </div>
    );
  }

  return (
    <>
      <PageTitle
        title='Editar Integração Omie'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: '/apps/omie', text: 'Omie' },
          { url: null, text: integration?.name || 'Editar' },
        ]}
      />

      <section id='page-apps-single'>
        <Card>
          <Card.Header>
            <h4 className='card-title'>Configurações da Integração</h4>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <div>
                      <span
                        className={`badge ${
                          integration?.status ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {integration?.status ? 'Ativo' : 'Inativo'}
                      </span>
                      <ButtonDS
                        size='sm'
                        variant='outline-primary'
                        className='ml-2'
                        onClick={handleToggleStatus}
                      >
                        {integration?.status ? 'Desativar' : 'Ativar'}
                      </ButtonDS>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>App Key</Form.Label>
                    <Form.Control
                      type='text'
                      name='app_key'
                      value={formData.app_key}
                      onChange={handleChange}
                      placeholder='Sua App Key do Omie'
                      required
                    />
                    <Form.Text className='text-muted'>
                      Chave de autenticação da aplicação Omie (app_key).
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>App Secret</Form.Label>
                    <Form.Control
                      type='password'
                      name='app_secret'
                      value={formData.app_secret}
                      onChange={handleChange}
                      placeholder='Seu App Secret do Omie'
                      required
                    />
                    <Form.Text className='text-muted'>
                      Segredo de autenticação da aplicação Omie (app_secret).
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Código do Produto</Form.Label>
                    <Form.Control
                      type='text'
                      name='product_code_omie'
                      value={formData.product_code_omie}
                      onChange={handleChange}
                      placeholder='Ex: 4422421'
                      required
                    />
                    <Form.Text className='text-muted'>
                      Código do produto que sempre será usado (previamente
                      cadastrado no Omie) (PRODUCT_CODE_OMIE).
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Código da Forma de Pagamento</Form.Label>
                    <Form.Control
                      type='text'
                      name='payment_code_omie'
                      value={formData.payment_code_omie}
                      onChange={handleChange}
                      placeholder='Ex: 999'
                      required
                    />
                    <Form.Text className='text-muted'>
                      Código da forma de pagamento ou código de parcela
                      (PAYMENT_CODE_OMIE).
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Código da Categoria</Form.Label>
                    <Form.Control
                      type='text'
                      name='category_code_omie'
                      value={formData.category_code_omie}
                      onChange={handleChange}
                      placeholder='Ex: 1.01.03'
                      required
                    />
                    <Form.Text className='text-muted'>
                      Categoria de pedido (se você usar) (CATEGORY_CODE_OMIE).
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Código da Conta Corrente</Form.Label>
                    <Form.Control
                      type='number'
                      name='account_code_omie'
                      value={formData.account_code_omie}
                      onChange={handleChange}
                      placeholder='Ex: 11850365'
                      required
                    />
                    <Form.Text className='text-muted'>
                      Conta corrente para lançamento (ACCOUNT_CODE_OMIE).
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Código do Cenário de Impostos</Form.Label>
                    <Form.Control
                      type='number'
                      name='scenario_code_omie'
                      value={formData.scenario_code_omie}
                      onChange={handleChange}
                      placeholder='Ex: 3'
                    />
                    <Form.Text className='text-muted'>
                      Cenário de impostos (opcional) (SCENARIO_CODE_OMIE).
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <div className='d-flex justify-content-between mt-4'>
                <div>
                  <ButtonDS
                    type='button'
                    variant='outline-info'
                    className='mr-2'
                    onClick={handleTestConnection}
                  >
                    Testar Conexão
                  </ButtonDS>
                  <ButtonDS
                    type='button'
                    variant='outline-secondary'
                    onClick={() => history.push('/apps/omie')}
                  >
                    Voltar
                  </ButtonDS>
                </div>
                <div>
                  <ButtonDS
                    type='button'
                    variant='outline-danger'
                    className='mr-2'
                    onClick={handleDelete}
                  >
                    Remover
                  </ButtonDS>
                  <ButtonDS type='submit' disabled={requesting}>
                    {requesting ? 'Salvando...' : 'Salvar'}
                  </ButtonDS>
                </div>
              </div>
            </form>
          </Card.Body>
        </Card>

        <Card className='mt-4'>
          <Card.Header>
            <h4 className='card-title'>Logs de Sincronização</h4>
          </Card.Header>
          <Card.Body>
            <p className='text-muted'>
              Logs de sincronização aparecerão aqui quando a integração estiver
              ativa.
            </p>
          </Card.Body>
        </Card>
      </section>
    </>
  );
};

export default PageAppsSingleOmie;
