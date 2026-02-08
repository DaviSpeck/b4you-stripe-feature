import { Col, Row, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import api from '../../../providers/api';
import { useEffect } from 'react';
import Loader from '../../../utils/loader';
import { Link } from 'react-router-dom';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const ModalRule = ({ uuidIntegration, setShow }) => {
  const [requesting, setRequesting] = useState(false);
  const [events, setEvents] = useState(null);
  const [products, setProducts] = useState(null);
  const [lists, setLists] = useState([]);

  const { register, handleSubmit, formState, watch } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;

  useEffect(() => {
    fetchData();
  }, []);

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
      })
      .catch(() => {})
      .finally();

    api
      .get(`/integrations/mailchimp/lists/${uuidIntegration}`)
      .then((response) => {
        setLists(response.data);
      })
      .catch(() => {})
      .finally();
  };

  const onSubmit = (data) => {
    setRequesting(true);

    let uuidProduct = watch('product');

    let fields = {
      id_rule: +data.id_rule,
      insert_list: data.insert_list === 'true',
      id_list: data.id_list,
    };

    api
      .post(
        `/integrations/mailchimp/product/${uuidProduct}/plugin/${uuidIntegration}`,
        fields
      )
      .then(() => {
        setShow(false);
      })
      .catch(() => {});
  };

  return (
    <>
      {events !== null && products !== null ? (
        <>
          <Row>
            <Col xs={12}>
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
            <Col xs={6}>
              <div className='form-group'>
                <label htmlFor=''>Ação</label>
                <Form.Control
                  as='select'
                  name='insert_list'
                  ref={register({ required: true })}
                >
                  <option value='true'>Inserir</option>
                  <option value='false'>Remover</option>
                </Form.Control>
              </div>
            </Col>
            <Col xs={12}>
              <div className='form-group'>
                <label htmlFor=''>Lista</label>
                <Form.Control
                  as='select'
                  name='id_list'
                  ref={register({ required: true })}
                  defaultValue='-1'
                >
                  {lists.length > 0 && (
                    <>
                      <option value='-1'>Escolher...</option>
                      {lists.map((item, index) => {
                        return (
                          <option key={index} value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                    </>
                  )}
                </Form.Control>
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
          <Loader title='carregando dados do mail chimp...' />
        </>
      )}
    </>
  );
};

export default ModalRule;
