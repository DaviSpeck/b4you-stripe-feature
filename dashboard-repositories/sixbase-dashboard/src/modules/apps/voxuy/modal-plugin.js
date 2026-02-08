import { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import Loader from '../../../utils/loader';
import { notify } from '../../functions';

const ModalPlugin = ({ uuidIntegration, setShow }) => {
  const { register, handleSubmit, errors, formState, watch } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;

  const [requesting, setRequesting] = useState(false);
  const [events, setEvents] = useState(null);
  const [products, setProducts] = useState(null);
  const [affiliatesProducts, setAffiliatesProducts] = useState([]);

  const fetchData = () => {
    api
      .get('/integrations/events')
      .then((response) => {
        setEvents(response.data);
      })
      .catch(() => {})
      .finally();

    api
      .get('/products/integrations')
      .then((response) => {
        setProducts(response.data.rows);
        setAffiliatesProducts(response.data.affiliates);
      })
      .catch(() => {})
      .finally();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = (data) => {
    setRequesting(true);
    let uuidProduct = watch('product');
    let fields = {
      id_rule: +data.id_rule,
      settings: { plan_id: data.settings },
    };
    api
      .post(
        `/integrations/voxuy/product/${uuidProduct}/plugin/${uuidIntegration}`,
        fields
      )
      .then(() => {
        notify({
          message: 'Regra criada com sucesso',
          type: 'success',
        });
        setShow(false);
      })
      .catch(() => {
        notify({
          message: 'Falha ao criar regra',
          type: 'error',
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  return (
    <>
      {(events !== null && products !== null) ||
      affiliatesProducts.length > 0 ? (
        <>
          <Row>
            <Col xs={6}>
              <div className='form-group'>
                <label htmlFor=''>Produto</label>
                <Form.Control
                  as='select'
                  name='product'
                  ref={register({ required: true })}
                  disabled={products.length === 0}
                >
                  {products.some((item) => item.payment_type === 'single') ? (
                    <optgroup label='Pagamento único'>
                      {products
                        .filter((p) => p.payment_type === 'single')
                        .map((item) => (
                          <option value={item.uuid} key={item.uuid}>
                            {item.name}
                          </option>
                        ))}
                    </optgroup>
                  ) : (
                    <></>
                  )}
                  {products.some((p) => p.payment_type !== 'single') ? (
                    <optgroup label='Pagamento recorrente'>
                      {products
                        .filter((p) => p.payment_type !== 'single')
                        .map((item) => (
                          <option value={item.uuid} key={item.uuid}>
                            {item.name}
                          </option>
                        ))}
                    </optgroup>
                  ) : (
                    <></>
                  )}
                  {affiliatesProducts.length > 0 ? (
                    <optgroup label='Afiliações'>
                      {affiliatesProducts.map((item) => (
                        <option
                          value={item.product.uuid}
                          key={item.product.uuid}
                        >
                          {item.product.name}
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    <></>
                  )}
                </Form.Control>
                {products.length === 0 && (
                  <div
                    className='mt-2'
                    style={{ fontSize: 12, color: '#ff285c' }}
                  >
                    Você não possui nenhum produto cadastrado.{' '}
                    <Link to='/produtos/listar' style={{ color: '#0f1b35' }}>
                      Cadastrar agora
                    </Link>
                  </div>
                )}
              </div>
            </Col>
            <Col xs={6}>
              <div className='form-group'>
                <label htmlFor=''>Evento</label>
                <Form.Control
                  as='select'
                  name='id_rule'
                  ref={register({ required: true })}
                >
                  {events.map((item, index) => {
                    return (
                      <option key={index} value={item.id}>
                        {item.label}
                      </option>
                    );
                  })}
                </Form.Control>
              </div>
            </Col>
            <Col xs={12}>
              <div className='form-group'>
                <label htmlFor='name'>Plano</label>
                <Form.Control
                  ref={register({ required: true })}
                  name='settings'
                  isInvalid={errors.name}
                />
              </div>
            </Col>
          </Row>

          <Row>
            <Col className='d-flex justify-content-end'>
              <ButtonDS
                size={'sm'}
                onClick={handleSubmit(onSubmit)}
                disabled={!isValid || watch('id_list') === '-1' || requesting}
              >
                {!requesting ? 'Salvar' : 'salvando...'}
              </ButtonDS>
            </Col>
          </Row>
        </>
      ) : (
        <>
          <Loader title='Carregando dados de Voxuy...' />
        </>
      )}
    </>
  );
};

export default ModalPlugin;
