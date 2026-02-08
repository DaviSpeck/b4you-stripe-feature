import { Col, Row, Button, Form, InputGroup } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import api from '../../../providers/api';
import { notify } from '../../functions';
import { nanoid } from 'nanoid';
import regexUrl from '../../../utils/regex-url';
import './style.scss';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const TYPE_ARCO = 3;
const ModalRule = ({ fetchData, setShow, webhook }) => {
  const [requesting, setRequesting] = useState(false);
  const [products, setProducts] = useState(null);
  const [affiliateProducts, setAffiliatesProducts] = useState(null);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [sbToken, setSbToken] = useState('');

  const refToken = useRef();
  const { register, handleSubmit, formState, reset } = useForm({
    mode: 'onChange',
  });

  const { isValid, errors } = formState;

  const fetchProducts = () => {
    api
      .get('/products/integrations')
      .then((response) => {
        const { rows, affiliates, suppliers } = response.data;

        setProducts(rows);
        setAffiliatesProducts(affiliates);
        setSupplierProducts(suppliers);
      })
      .catch(() => {});
  };

  const renderOptions = (affiliatesProducts, products, supplierProducts) => {
    const options = [
      <option key='no_product' value={''}>
        Todos que sou produtor
      </option>,
    ];
    if (affiliatesProducts && affiliatesProducts.length > 0)
      options.push(
        <option key='all_affiliate' value={'all_affiliate'}>
          Todos que sou afiliado
        </option>
      );
    if (supplierProducts && supplierProducts.length > 0)
      options.push(
        <option key='all_supplier' value={'all_supplier'}>
          Todos que sou fornecedor
        </option>
      );
    if (products && products.length > 0) options.push(renderProducts(products));

    options.push(renderProductsAffiliate(affiliatesProducts));
    options.push(renderProductsSupplier(supplierProducts));

    return options;
  };

  const onSubmit = (data) => {
    setRequesting(true);

    const isAffiliateProduct = affiliateProducts.find(
      ({ product }) => product.uuid === data.product
    );
    const isSupplierProduct = supplierProducts.find(
      ({ product }) => product.uuid === data.product
    );

    let is_affiliate = false;
    let is_supplier = false;
    if (isAffiliateProduct || data.product === 'all_affiliate')
      is_affiliate = true;
    if (isSupplierProduct || data.product === 'all_supplier')
      is_supplier = true;

    const body = {
      product_id: data.product,
      name: data.name,
      url: data.url,
      token: sbToken,
      is_affiliate,
      id_type: TYPE_ARCO,
      is_supplier,
    };

    if (webhook) {
      api
        .put(`/integrations/arco/${webhook.uuid}`, body)
        .then(() => {
          fetchData();
          setShow(false);
          notify({
            message: 'Webhook atualizado com sucesso',
            type: 'success',
          });
        })
        .catch((err) => {
          if (err.response.status === 400) {
            notify({
              message: err.response.data.message,
              type: 'error',
            });
          } else {
            notify({
              message: 'Falha ao atualizar webhook',
              type: 'error',
            });
          }
        })
        .finally(() => setRequesting(false));
    } else {
      api
        .post('/integrations/arco', body)
        .then(() => {
          fetchData();
          setShow(false);
          notify({
            message: 'Integração criada com sucesso',
            type: 'success',
          });
        })
        .catch((err) => {
          if (err.response.status === 400) {
            notify({
              message: err.response.data.message,
              type: 'error',
            });
          } else {
            notify({
              message: 'Falha ao criar webhook',
              type: 'error',
            });
          }
        })
        .finally(() => setRequesting(false));
    }
  };

  const renderProducts = (products) => {
    return (
      <>
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
      </>
    );
  };

  const renderProductsAffiliate = (affiliateProducts) => {
    return (
      <>
        {affiliateProducts && affiliateProducts.length > 0 && (
          <optgroup label='Produtos que sou afiliado'>
            {affiliateProducts.map((item) => (
              <option value={item.product.uuid} key={item.product.uuid}>
                {item.product.name}
              </option>
            ))}
          </optgroup>
        )}
      </>
    );
  };

  const renderProductsSupplier = (supplierProducts) => {
    const validProducts = supplierProducts?.filter((item) => item.product);
    if (!validProducts || validProducts.length === 0) return null;
    return (
      <optgroup label='Produtos que sou fornecedor'>
        {validProducts.map((item) => (
          <option value={item.product.uuid} key={item.product.uuid}>
            {item.product.name}
          </option>
        ))}
      </optgroup>
    );
  };

  useEffect(() => {
    fetchProducts();

    if (webhook) {
      setSbToken(webhook.token);
      reset();
    } else {
      setSbToken(nanoid(32));
    }

    return () => {
      setSbToken(null);
    };
  }, [webhook]);

  useEffect(() => {
    if (webhook && products) {
      const eventsToReset = {};
      for (const e of webhook.events) {
        eventsToReset[`event.${e.id}`] = true;
      }

      eventsToReset.name = webhook.name;
      eventsToReset.url = webhook.url;
      eventsToReset.product = '';
      if (webhook.product) eventsToReset.product = webhook.product.uuid;
      if (webhook.is_affiliate && !webhook.product)
        eventsToReset.product = 'all_affiliate';

      reset(eventsToReset);
    }
  }, [products, webhook]);

  return (
    <section id='modal-rule-webhooks'>
      <Row>
        <Col xs={12}>
          <div className='form-group'>
            <label htmlFor=''>Nome da Integração</label>
            <Form.Control
              ref={register({ required: true })}
              name='name'
              isInvalid={errors.name}
            />
          </div>
        </Col>
        <Col xs={12}>
          <div className='form-group'>
            <label htmlFor=''>URL de postback estrangeira</label>
            <InputGroup>
              <Form.Control
                ref={register({
                  required: true,
                  validate: (value) => {
                    return regexUrl(value);
                  },
                })}
                name='url'
                isInvalid={errors.url}
              />
            </InputGroup>
          </div>
        </Col>
        <Col xs={12}>
          <div className='form-group'>
            <label htmlFor=''>B4you Token</label>
            <InputGroup>
              <Form.Control
                ref={refToken}
                name='token'
                onChange={() => true}
                value={sbToken}
                isInvalid={errors.token}
                disabled={true}
              />
              <InputGroup.Append>
                <Button
                  onClick={() => {
                    if (refToken.current) {
                      refToken.current.select();
                      navigator.clipboard.writeText(refToken.current.value);
                    }
                    notify({
                      message: 'Código copiado com sucesso',
                      type: 'success',
                    });
                  }}
                >
                  <i className='bx bx-copy' style={{ fontSize: '12px' }}></i>
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </div>
        </Col>
        <Col xs={12}>
          <div className='form-group'>
            <label htmlFor=''>Produto</label>
            <Form.Control
              name='product'
              ref={register()}
              as='select'
              isInvalid={errors.product}
              defaultValue={webhook}
            >
              {renderOptions(affiliateProducts, products, supplierProducts)}
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
    </section>
  );
};

export default ModalRule;
