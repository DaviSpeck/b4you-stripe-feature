import { Col, Row, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import api from '../../../providers/api';
import { notify } from '../../functions';
import Loader from '../../../utils/loader';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const ModalCredential = ({ fetchData, setShow }) => {
  const [requesting, setRequesting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [products, setProducts] = useState([]);

  const { register, handleSubmit, errors, formState } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;

  useEffect(() => {
    getAllProducts();
  }, []);

  const getAllProducts = () => {
    api
      .get('/products/integrations')
      .then((response) => {
        setProducts(response.data.rows);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  };

  const onSubmit = (data) => {
    setRequesting(true);

    api
      .post('/integrations/hotzapp', data)
      .then(() => {
        fetchData();
        setShow(false);
        notify({
          message: 'Credencial criada com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao criar credencial',
          type: 'error',
        });
      })
      .finally(() => setRequesting(false));
  };
  return (
    <>
      {fetching ? (
        <Loader />
      ) : (
        <>
          <Row>
            <Col xs={12}>
              <div className='form-group'>
                <label htmlFor=''>Url</label>
                <Form.Control
                  ref={register({ required: true })}
                  name='url'
                  isInvalid={errors.url}
                />
              </div>
            </Col>
            <Col xs={12}>
              <div className='form-group'>
                <label htmlFor=''>UUID do produto</label>
                <Form.Control
                  as='select'
                  ref={register()}
                  name='product_uuid'
                  isInvalid={errors.product_uuid}
                >
                  <option value={''}>Todos os produtos</option>
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
              </div>
            </Col>
          </Row>
          <Row>
            <Col className='d-flex justify-content-end'>
              <ButtonDS
                size={'sm'}
                onClick={handleSubmit(onSubmit)}
                disabled={!isValid || requesting}
              >
                {!requesting ? 'Salvar' : 'salvando...'}
              </ButtonDS>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default ModalCredential;
