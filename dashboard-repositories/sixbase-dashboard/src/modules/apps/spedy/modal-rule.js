import { Col, Row, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import api from '../../../providers/api';
import { notify } from '../../functions';
import { nanoid } from 'nanoid';
import regexUrl from '../../../utils/regex-url';
import './style.scss';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const spedy_type = 4;

const ModalRule = ({ fetchData, setShow, webhook }) => {
  const [requesting, setRequesting] = useState(false);
  const [products, setProducts] = useState(null);
  const [affiliateProducts, setAffiliatesProducts] = useState(null);
  const [suppliersProducts, setSuppliersProducts] = useState([]);
  const [events, setEvents] = useState(null);
  const [sbToken, setSbToken] = useState('');
  const [allEvents, setAllEvents] = useState(false);
  const refToken = useRef();

  const { register, handleSubmit, formState, reset, watch } = useForm({
    mode: 'onChange',
  });

  const eventsForm = watch('event');

  const { isValid, errors } = formState;

  const fetchProducts = () => {
    api
      .get(`/products/integrations`)
      .then((response) => {
        const { rows, affiliates, suppliers } = response.data;
        setProducts(rows);
        setAffiliatesProducts(affiliates);
        setSuppliersProducts(suppliers);
      })
      .catch(() => {});
  };

  const renderOptions = (affiliatesProducts, products, suppliersProducts) => {
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
    if (suppliersProducts && suppliersProducts.length > 0)
      options.push(
        <option key='all_supplier' value={'all_supplier'}>
          Todos que sou fornecedor
        </option>
      );
    if (products && products.length > 0) options.push(renderProducts(products));

    options.push(renderProductsAffiliate(affiliatesProducts));
    options.push(renderProductsSupplier(suppliersProducts));

    return options;
  };

  const fetchEvents = () => {
    api
      .get('/integrations/events')
      .then((response) => {
        const { data } = response;
        const filtered = data.filter((evento) =>
          ['approved-payment', 'refused-payment', 'refund'].includes(evento.key)
        );
        setEvents(filtered);
      })
      .catch(() => {});
  };

  const onSubmit = (data) => {
    setRequesting(true);
    const events = [];
    // map events to dispatch
    for (const id of Object.keys(data.event)) {
      if (data.event[id]) {
        events.push(id);
      }
    }

    if (events.length === 0) {
      notify({
        message: 'Selecione ao menos um evento',
        type: 'error',
      });
      setRequesting(false);
      return;
    }

    const isAffiliateProduct = affiliateProducts.find(
      ({ product }) => product.uuid === data.product
    );

    const isSupplierProduct = suppliersProducts.find(
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
      events,
      name: data.name,
      url: data.url,
      token: sbToken,
      is_affiliate,
      is_supplier,
      id_type: spedy_type,
    };

    if (webhook) {
      api
        .put(`/integrations/webhooks/${webhook.uuid}`, body)
        .then(() => {
          fetchData();
          setShow(false);
          notify({
            message: 'Atualizado com sucesso',
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
              message: 'Falha ao atualizar',
              type: 'error',
            });
          }
        })
        .finally(() => setRequesting(false));
    } else {
      api
        .post('/integrations/webhooks', body)
        .then(() => {
          fetchData();
          setShow(false);
          notify({
            message: 'Criado com sucesso',
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
              message: 'Falha ao criar',
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
    return (
      <>
        {supplierProducts && supplierProducts.length > 0 && (
          <optgroup label='Produtos que sou fornecedor'>
            {supplierProducts.map((item) => (
              <option value={item.product.uuid} key={item.product.uuid}>
                {item.product.name}
              </option>
            ))}
          </optgroup>
        )}
      </>
    );
  };

  useEffect(() => {
    fetchProducts();
    fetchEvents();

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
    if (webhook && events && products) {
      const eventsToReset = {};
      for (const e of webhook.events) {
        eventsToReset[`event.${e.id}`] = true;
      }

      if (webhook.events.length === events.length) setAllEvents(true);

      eventsToReset.name = webhook.name;
      eventsToReset.url = webhook.url;
      eventsToReset.product = '';
      if (webhook.product) eventsToReset.product = webhook.product.uuid;
      if (webhook.is_affiliate && !webhook.product)
        eventsToReset.product = 'all_affiliate';

      reset(eventsToReset);
    }
    return () => {
      if (events) {
        const eventsToReset = {};
        for (const e of events) {
          eventsToReset[`event.${e.id}`] = false;
        }
        eventsToReset.name = '';
        eventsToReset.url = '';
        eventsToReset.product = '';
        reset(eventsToReset);
      }
    };
  }, [events, products, webhook]);

  useEffect(() => {
    if (eventsForm) {
      const allChecked = eventsForm.reduce((acc, obj) => {
        return (acc = acc && obj);
      }, true);

      if (allChecked && allEvents === false) setAllEvents(true);
      if (!allChecked && allEvents === true) setAllEvents(false);
    }
  }, [eventsForm]);

  if (events === null) {
    return (
      <div className='d-flex justify-content-center align-items-center p-5'>
        <Spinner animation='border' role='status'>
          <span className='sr-only'>Carregando...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <section id='modal-rule-webhooks'>
      <Row>
        <Col xs={12}>
          <div className='form-group'>
            <label htmlFor=''>Nome</label>
            <Form.Control
              ref={register({ required: true })}
              name='name'
              isInvalid={errors.name}
            />
          </div>
        </Col>
        <Col xs={12}>
          <div className='form-group'>
            <label htmlFor=''>URL</label>
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
              />
              <InputGroup.Append>
                <Button
                  onClick={() => {
                    if (refToken.current) {
                      refToken.current.select();
                      navigator.clipboard.writeText(refToken.current.value);
                    }
                    notify({
                      message: 'Link copiado com sucesso',
                      type: 'success',
                    });
                  }}
                >
                  <i className='bx bx-copy' style={{ fontSize: '24px' }}></i>
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
              {renderOptions(affiliateProducts, products, suppliersProducts)}
            </Form.Control>
          </div>
        </Col>
        <Col xs={12}>
          <div className='form-group'>
            <label htmlFor=''>
              Eventos:
              <Form.Check
                id='webhooks_events_all'
                inline
                className='form-check-all'
                checked={allEvents}
                label='selecionar todos'
                onChange={(e) => {
                  const { checked } = e.target;
                  const eventsToReset = {};
                  for (const e of events) {
                    eventsToReset[`event.${e.id}`] = checked;
                  }
                  reset(eventsToReset);
                  setAllEvents(checked);
                }}
              ></Form.Check>
            </label>

            {events !== null &&
              events.map((e) => (
                <Form.Check
                  id={`webhooks_events_${e.id}`}
                  key={`webhooks_events_${e.id}`}
                  name={`event.${e.id}`}
                  ref={register()}
                  type='checkbox'
                  label={e.label}
                ></Form.Check>
              ))}
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
