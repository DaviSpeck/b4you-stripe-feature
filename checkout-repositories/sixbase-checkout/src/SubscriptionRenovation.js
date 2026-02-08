import SvgPix from 'SvgPix';
import api from 'api';
import { useEffect, useState } from 'react';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ReactInputMask from 'react-input-mask';
import Cards from 'react-credit-cards';
import { currency } from 'functions';
import SubscriptionPayCard from 'SubscriptionPayCard';
import SubscriptionPayPix from 'SubscriptionPayPix';

const SubscriptionRenovation = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [subscriptionData, setSubscriptionData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [installmentsList, setInstallmentsList] = useState(
    subscriptionData?.plan?.installments_list?.length
  );

  const urlParams = new URLSearchParams(window.location.search);
  const subscriptionIdParam = urlParams.get('subscription_id');

  useEffect(() => {
    api
      .get(`renew/${subscriptionIdParam}`)
      .then((r) => {
        setSubscriptionData(r.data);
        setInstallmentsList(r.data.plan.installments_list.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { register, formState, handleSubmit } = useForm({
    mode: 'onSubmit',
  });
  const { errors } = formState;

  const [fields, setFields] = useState({
    cvc: '',
    expiry: '',
    cardHolder: '',
    number: '',
    focused: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFields((prevFields) => ({ ...prevFields, [name]: value }));
  };

  const handleInputFocus = (e) => {
    const { name } = e.target;

    setFields((prevFields) => ({ ...prevFields, focused: name }));
  };

  const onSubmit = async (data, e) => {
    e.preventDefault();
    setShowModal(true);
  };
  const onError = async (errors, e) => {
    e.preventDefault();
  };

  return (
    <>
      {!loading && subscriptionData !== null && (
        <Row className='d-flex justify-content-center align-items-center'>
          <Col lg={8} md={12} className='container-wrap d-flex m0-auto'>
            <form
              onSubmit={handleSubmit(onSubmit, onError)}
              className='form-renovation'
            >
              <div className='header input-group mb-3 '>
                {subscriptionData.product.logo ? (
                  <img
                    src={subscriptionData.product.logo}
                    className='logo'
                    style={{ borderRadius: 6 }}
                  />
                ) : (
                  <h2>{subscriptionData.product.name}</h2>
                )}
              </div>
              <div className='pay-info form-group'>
                <div className='input-group-2'>
                  <div className='area'>
                    <button
                      type='button'
                      id='btn-card'
                      className={
                        paymentMethod === 'card' ? 'btn active' : 'btn'
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setPaymentMethod('card');
                      }}
                    >
                      <i className='las la-credit-card' />
                      <span>Cartão de crédito</span>
                    </button>
                  </div>
                </div>

                <div className='input-group-2'>
                  <div className='area'>
                    <button
                      type='button'
                      id='btn-credit-billet'
                      className={
                        paymentMethod === 'pix'
                          ? 'btn btn-pix active'
                          : 'btn btn-pix'
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setPaymentMethod('pix');
                      }}
                    >
                      <SvgPix />
                      <span>Pix</span>
                    </button>
                  </div>
                </div>
              </div>

              {paymentMethod == 'card' && (
                <div className='pay-card'>
                  <div className='row'>
                    <div className='col-lg-6 col-md-12'>
                      <div className='input-group mb-3'>
                        <div className='area'>
                          <label htmlFor='card'>
                            <i className='las la-credit-card' />
                          </label>
                          <ReactInputMask
                            {...register('number', {
                              required: {
                                value: paymentMethod === 'card',
                                message: 'Informe um número válido',
                              },
                              validate: (value) => {
                                return value.replace(/\D/g, '').length >= 15;
                              },
                            })}
                            autoComplete='cc-number'
                            id='number'
                            type='tel'
                            placeholder='Número do Cartão'
                            onKeyUp={handleInputChange}
                            onFocus={handleInputFocus}
                            mask='9999 9999 9999 999999'
                            maskChar=''
                            className={
                              errors.number
                                ? 'form-control is-invalid'
                                : 'form-control'
                            }
                          />
                          <div className='input-error'>
                            {errors?.number?.message}
                          </div>
                        </div>
                      </div>

                      <div className='date form-group mb-3'>
                        <div className='input-group'>
                          <div className='area'>
                            <label htmlFor='cc-exp'>
                              <i className='las la-calendar-minus'></i>
                            </label>

                            <ReactInputMask
                              {...register('expiry', {
                                required: {
                                  value: paymentMethod === 'card',
                                  message: 'Data é obrigatória',
                                },
                                validate: (e) =>
                                  e.replaceAll('/', '').replaceAll('_', '')
                                    .length === 4,
                              })}
                              autoComplete='cc-exp'
                              id='expiry'
                              type='tel'
                              placeholder='MM/AA'
                              onKeyUp={handleInputChange}
                              onFocus={handleInputFocus}
                              mask='99/99'
                              className={
                                errors.expiry
                                  ? 'form-control is-invalid'
                                  : 'form-control'
                              }
                              // disabled={disabled}
                            />
                            <div className='input-error'>
                              {errors?.expiry?.message}
                            </div>
                          </div>
                        </div>
                        <div className='input-group'>
                          <div className='area'>
                            <label htmlFor='cvc'>
                              <i className='las la-lock'></i>
                            </label>
                            <Form.Control
                              {...register('cvc', {
                                required: {
                                  value: paymentMethod === 'card',
                                  message: 'CVC é obrigatório',
                                },
                                minLength: 3,
                              })}
                              onKeyUp={handleInputChange}
                              onFocus={handleInputFocus}
                              maxLength={4}
                              autoComplete='cc-csc'
                              id='cvc'
                              type='text'
                              placeholder='CVC/CVV'
                              className={errors.cvc ? 'is-invalid' : null}
                            />
                            <div className='input-error'>
                              {errors?.cvc?.message}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='input-group mb-3'>
                        <div className='area'>
                          <label htmlFor='name'>
                            <i className='las la-user' />
                          </label>
                          <Form.Control
                            {...register('cardHolder', {
                              minLength: 3,
                              required: {
                                value: paymentMethod === 'card',
                                message: 'Nome é obrigatório',
                              },
                              pattern: {
                                value: /^[a-zA-Z ]+$/,
                                message: 'Permitido apenas letras',
                              },
                            })}
                            onKeyUp={handleInputChange}
                            onFocus={handleInputFocus}
                            autoComplete='cc-name'
                            id='cardHolder'
                            className={errors.cardHolder ? 'is-invalid' : null}
                            type='text'
                            placeholder='Nome do titular'
                          />
                          <div className='input-error'>
                            {errors?.cardHolder?.message}
                          </div>
                        </div>
                      </div>
                      <div className='input-group mb-3'>
                        <div className='area'>
                          <span className='installments-options'>
                            Opções de parcelamento
                          </span>
                          <Form.Control
                            {...register('installments', {
                              required: paymentMethod === 'card',
                            })}
                            as='select'
                            onChange={(e) => {
                              setInstallmentsList(e.target.value);
                            }}
                            value={installmentsList}
                          >
                            {subscriptionData.plan.installments_list.map(
                              (item) => (
                                <option
                                  value={item.n}
                                  key={item.n}
                                  onClick={(e) =>
                                    setInstallmentsList(e.target.value)
                                  }
                                >
                                  {item.n}x de {currency(item.price)}
                                  {item.n > 1 &&
                                  subscriptionData.plan.student_pays_interest
                                    ? '*'
                                    : ''}
                                </option>
                              )
                            )}
                          </Form.Control>
                        </div>
                      </div>
                    </div>
                    <div className='card-preview col-lg-6 col-md-12 border-left'>
                      <Cards
                        focused={fields.focused}
                        cvc={fields.cvc}
                        expiry={fields.expiry}
                        name={fields.cardHolder}
                        number={fields.number}
                        locale={{ valid: 'validade' }}
                        placeholders={{ name: 'Titular do Cartão' }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {paymentMethod == 'pix' && (
                <div className='pay-pix'>
                  <div>
                    <h2>Pague com o Pix, qualquer dia, a qualquer hora:</h2>
                    <ul>
                      <li>Pix somente à vista.</li>
                      <li>Liberação imediata!</li>
                      <li>
                        É simples, só clicar no botão{' '}
                        <span>&quot;Comprar Agora&quot;</span> abaixo;
                      </li>
                      <li>
                        E usar o aplicativo do seu banco selecionando a opção
                        PIX;
                      </li>
                      <li>
                        Super seguro. O pagamento PIX foi desenvolvido pelo
                        Banco Central do Brasil.
                      </li>
                      <li>
                        Valor no Pix: {currency(subscriptionData.plan.price)}
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              <section id='plans'>
                <div className='card-head'>Seu plano de assinatura</div>
                <div className='plans-list'>
                  <div className='plan active'>
                    <div className='header'> {subscriptionData.plan.label}</div>
                    <div className={'content-box-shadow mt-0'}>
                      <div className='list-item'>
                        <span className='price'>
                          {currency(subscriptionData.plan.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <button
                  className='btn w-100 py-3 mt-0 text-break'
                  type='submit'
                >
                  <span>Renovar Agora</span>
                </button>
                {Object.keys(errors).length > 0 && (
                  <span className='alert-fields-invalid'>
                    Preencha <b>TODOS</b> os campos corretamente
                  </span>
                )}
                <div className='security'>
                  <div className='button-security'>
                    <i className='bx bxs-check-shield'></i>
                    <div className='texts'>
                      <div className='title'>Compra Segura</div>
                      <div className='label'>Ambiente Seguro e Autenticado</div>
                    </div>
                  </div>
                  <div className='button-security'>
                    <i className='bx bx-fingerprint'></i>
                    <div className='texts'>
                      <div className='title'>Privacidade</div>
                      <div className='label'>Sua informação 100% segura</div>
                    </div>
                  </div>
                </div>
              </section>
            </form>
          </Col>
        </Row>
      )}
      <Modal
        id='modal'
        show={showModal}
        size='lg'
        onHide={() => setShowModal(false)}
        backdrop='static'
        keyboard={false}
        centered
      >
        {paymentMethod === 'card' && (
          <SubscriptionPayCard
            subscription_id={subscriptionIdParam}
            payment_method={paymentMethod}
            card_number={fields.number}
            card_holder={fields.cardHolder}
            expiration_date={fields.expiry}
            cvv={fields.cvc}
            installmentsList={installmentsList}
          />
        )}
        {paymentMethod === 'pix' && (
          <SubscriptionPayPix
            subscription_id={subscriptionIdParam}
            payment_method={paymentMethod}
          />
        )}
      </Modal>
    </>
  );
};

export default SubscriptionRenovation;
