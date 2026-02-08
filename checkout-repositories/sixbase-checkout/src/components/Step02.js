import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { PatternFormat } from 'react-number-format';
import { verifyRegionByZipcode } from '../utils/findZipcodeRegion';
import styles from './Step02.module.css';

import api from 'api';
import cepPromise from 'cep-promise';
import { cpf } from 'cpf-cnpj-validator';
import { cleanDocument, googleAnalyticsSend } from 'functions.js';
import Loader from 'Loader';
import useQuery from 'query/queryHook';
import { toast } from 'react-toastify';

export function Step02({
  offer,
  setCustomerDataSent,
  setFullName,
  uuidOffer,
  product,
  orderBumps,
  register,
  formState,
  setValue,
  getValues,
  control,
  setFocus,
  setError,
  clearErrors,
  googlePixels,
  setCurrentStep,
  setTopLevelDelivery,
  currentStep,
  isEditBtn,
  handleChangeShipping,
  shippingOptions,
  setSelectedOption,
  selectedOption,
  currency,
  hasFrenet,
  trackEvent,
}) {
  const query = useQuery();
  const [delivery, setDelivery] = useState(null);
  const [copyOfCEP, setCopyOfCEP] = useState(false);
  const [formWithErros, setFormWithErros] = useState(false);
  const [invalidZipCode, setInvalidZipCode] = useState(false);
  const [isAnyKeyEmpty, setIsAnyKeyEmpty] = useState(false);
  const [hasCEP, setHasCEP] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [isObPhysical, setIsObPhysical] = useState(false);
  const startedRef = useRef(false);
  const completedRef = useRef(false);

  const { errors, isValid } = formState;

  const tracked = (eventName, details) => {
    if (!trackEvent) return;
    trackEvent(eventName, details);
  };

  const initiateCart = async () => {
    setCopyOfCEP(getValues('zipcode'));

    if (getValues('zipcode') === '') {
      setInvalidZipCode(true);
    }
    if (getValues('full_name') === '') {
      return false;
    }
    if (getValues('email') === '') {
      return false;
    }
    if (getValues('document') === '' || !cpf.isValid(getValues('document'))) {
      return false;
    }
    if (getValues('whatsapp') === '') {
      return false;
    }

    let body = {
      full_name: getValues('full_name'),
      email: getValues('email'),
      document_number: cleanDocument(getValues('document')),
      whatsapp: getValues('whatsapp'),
      offer_uuid: uuidOffer,
      address: {
        zipcode: delivery === null ? getValues('zipcode') : delivery?.cep,
        street: getValues('street'),
        number: getValues('number_address'),
        complement: getValues('complement'),
        neighborhood: getValues('neighborhood'),
        city: delivery === null ? getValues('city') : delivery?.localidade,
        state: delivery === null ? getValues('state') : delivery?.uf,
      },
      params: {},
    };

    if (query.get('src')) body['params']['src'] = query.get('src');
    if (query.get('sck')) body['params']['sck'] = query.get('sck');
    if (query.get('utm_source'))
      body['params']['utm_source'] = query.get('utm_source');
    if (query.get('utm_medium'))
      body['params']['utm_medium'] = query.get('utm_medium');
    if (query.get('utm_campaign'))
      body['params']['utm_campaign'] = query.get('utm_campaign');
    if (query.get('utm_content'))
      body['params']['utm_content'] = query.get('utm_content');
    if (query.get('utm_term'))
      body['params']['utm_term'] = query.get('utm_term');
    if (query.get('b1')) body['params']['b1'] = query.get('b1');
    if (query.get('b2')) body['params']['b2'] = query.get('b2');
    if (query.get('b3')) body['params']['b3'] = query.get('b3');
    api
      .post('/cart/initiate', body)
      .then(async (r) => {
        if (r.data === 'OK') {
          if (product.type !== 'physical') {
            setCustomerDataSent(true);
          }
          setFullName(body.full_name);
        }
      })
      .catch(() => {
        setCustomerDataSent(false);
      });
  };

  useEffect(() => {
    if (isValid) initiateCart();
  }, [isValid]);

  useEffect(() => {
    if (currentStep === 2 && !startedRef.current) {
      tracked('checkout_address_started', {
        step: 'address',
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
      startedRef.current = true;
    }
  }, [currentStep, trackEvent]);

  useEffect(() => {
    setFocus('full_name');
    const zipcode = query.get('zipcode') ?? '';
    if (zipcode) {
      getDelivery(zipcode);
    }
  }, []);

  const getDelivery = (cep) => {
    setLoadingCEP(true);

    cepPromise(cep)
      .then((r) => {
        setDelivery({ ...r, uf: r.state, localidade: r.city });
        setTopLevelDelivery({ ...r, uf: r.state, localidade: r.city });
        setValue('street', r.street);
        setValue('neighborhood', r.neighborhood);
        setValue('city', r.city);
        setValue('state', r.state);
        clearErrors(['zipcode', 'street', 'neighborhood']);
        initiateCart();
        if (googlePixels.length > 0) {
          googlePixels.forEach(() => {
            if (offer.offerShopify && Array.isArray(offer.offerShopify)) {
              googleAnalyticsSend('add_shipping_info', {
                currency: 'BRL',
                value: offer.price,
                items: offer.offerShopify.map((item, index) => ({
                  item_name: item.title,
                  item_id: item.variant_id,
                  index: index,
                  quantity: item.quantity,
                  price: parseFloat(item.price),
                })),
              });
            } else {
              googleAnalyticsSend('add_shipping_info', {
                currency: 'BRL',
                value: offer.price,
                items: [{ item_name: offer.product.name }],
              });
            }
          });
        }

        if (
          Object.keys(offer.shipping_by_region).length !== 0 &&
          offer.shipping_type !== 0
        ) {
          const cepRegion = verifyRegionByZipcode(getValues('zipcode'));
          switch (cepRegion) {
            case 'NO':
              offer.shipping_price = offer.shipping_by_region.no;
              break;
            case 'NE':
              offer.shipping_price = offer.shipping_by_region.ne;
              break;
            case 'CO':
              offer.shipping_price = offer.shipping_by_region.co;
              break;
            case 'SE':
              offer.shipping_price = offer.shipping_by_region.so;
              break;
            case 'SU':
              offer.shipping_price = offer.shipping_by_region.su;
              break;
          }
          handleChangeShipping(true);
        }

        setHasCEP(true);
        setInvalidZipCode(false);
        setFormWithErros(false);
      })
      .catch(() => {
        setHasCEP(false);
        setInvalidZipCode(true);
        setFormWithErros(true);
        tracked('checkout_address_error', {
          step: 'address',
          email: getValues('email'),
          phone: getValues('whatsapp'),
        });

        toast.error(
          'CEP inválido. Verifique o CEP digitado e tente novamente.'
        );
      })
      .finally(() => {
        setLoadingCEP(false);
      });
  };

  useEffect(() => {
    const ObPhysical =
      orderBumps.filter(
        (item) => item.quantity > 0 && item.product.type === 'physical'
      ).length > 0;
    setIsObPhysical(ObPhysical);

    if (!ObPhysical) {
      clearErrors('zipcode');
    }

    if (product.type !== 'physical') {
      if (
        orderBumps.filter(
          (item) => item.quantity > 0 && item.product.type === 'physical'
        ).length > 0 &&
        !delivery
      ) {
        setError('zipcode');
        setCustomerDataSent(false);
      }
    }
  }, [orderBumps]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setCustomerDataSent(false);
    } else {
      setCustomerDataSent(true);
    }
  });
  /*************************************************/

  const values = {
    street: Boolean(getValues('street')),
    number_address: Boolean(getValues('number_address')),
    neighborhood: Boolean(getValues('neighborhood')),
  };

  const handleClick = () => {
    const addressRequired =
      offer.require_address || product.type === 'physical' || isObPhysical;
    if (!addressRequired) {
      clearErrors();
      setIsAnyKeyEmpty(false);
      setFormWithErros(false);
      setCurrentStep(3);
      return;
    }

    let hasEmpty = false;

    Object.entries(values).forEach(([key, value]) => {
      if (value) return;
      setError(key, { message: 'campo obrigatório' });
    });

    for (let key in values) {
      if (!values[key]) {
        hasEmpty = true;
        setIsAnyKeyEmpty(true);
        break;
      }
    }

    if ((hasEmpty || !Boolean(copyOfCEP)) && currentStep === 2) {
      !Boolean(copyOfCEP) && setFormWithErros(true);
      tracked('checkout_address_error', {
        step: 'address',
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
      setCurrentStep(2);
      return;
    }

    clearErrors();
    setIsAnyKeyEmpty(false);
    setFormWithErros(false);
    setCurrentStep(3);
    if (!completedRef.current) {
      tracked('checkout_address_filled', {
        step: 'address',
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
      tracked('checkout_address_completed', {
        step: 'address',
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
      completedRef.current = true;
    }

    if (offer.offerShopify && Array.isArray(offer.offerShopify)) {
      googleAnalyticsSend('add_shipping_info', {
        currency: 'BRL',
        value: offer.price,
        user_data: {
          city: getValues('city'),
          country: getValues('state'),
          customer_id: '',
          email: getValues('email'),
          first_name: getValues('full_name'),
          last_name: '',
          phone: getValues('whatsapp'),
          region: getValues('neighborhood'),
          street: getValues('street'),
          zip: getValues('zipcode'),
        },
        items: offer.offerShopify.map((item, index) => ({
          item_name: item.title,
          item_id: item.variant_id,
          index: index,
          quantity: item.quantity,
          price: parseFloat(item.price),
        })),
      });
    }
  };

  const handleInputStateRequired = (key, value) => {
    setValue(key, value);
    Boolean(value)
      ? clearErrors(key)
      : setError(key, {
          message: 'campo obrigatório',
        });
  };

  useEffect(() => {
    const keys = ['street', 'number_address', 'neighborhood'];
    const isAnyValueEmpty = getValues(keys).some(
      (value) => value === null || value === undefined || value === ''
    );

    if (isAnyValueEmpty) {
      setIsAnyKeyEmpty(true);
      return;
    }

    setIsAnyKeyEmpty(false);
  }, [getValues()]);

  useMemo(() => {
    if (currentStep === 2) return;
    setCopyOfCEP(getValues('zipcode'));
    clearErrors();
    setIsAnyKeyEmpty(false);
    setFormWithErros(false);
  }, [currentStep]);

  const hexColor = offer.checkout.hex_color
    ? offer.checkout.hex_color
    : 'var(--hex-color, rgba(248, 107, 134, 1))';

  return (
    <>
      <div
        className={styles.div01}
        style={{
          display: currentStep === 2 ? '' : 'none',
          '--hex-color': hexColor,
        }}
      >
        <div className={styles.frame37254}>
          <div className={styles.frame37253}>
            <span className={styles.text08}>2</span>
          </div>
          <span className={styles.text09}>
            <span>Entrega</span>
          </span>
        </div>
        <span className={styles.text11}>
          <span>
            {offer.require_address ||
            product.type === 'physical' ||
            isObPhysical
              ? 'Digite aqui seu endereço para entrega.'
              : 'Este produto não requer endereço de entrega.'}
          </span>
        </span>
        {(offer.require_address ||
          product.type === 'physical' ||
          isObPhysical) && (
          <div className={styles.frame372571}>
            <div className={styles.inputfield}>
              <div className={styles.inputfieldbase}>
                <div className={styles.inputwithlabel}>
                  <span className={styles.text19}>
                    <span>CEP</span>
                  </span>

                  <div style={{ position: 'relative', width: '100%' }}>
                    <Controller
                      id='zipcode'
                      name='zipcode'
                      control={control}
                      render={({ field }) => {
                        return (
                          <PatternFormat
                            value={field.value}
                            onBlur={initiateCart}
                            onValueChange={(values) => {
                              if (values.value.length === 8) {
                                getDelivery(values.value);
                              } else {
                                setHasCEP(false);
                                setInvalidZipCode(true);
                                setDelivery(null);
                                setTopLevelDelivery(null);
                                setValue('street', '');
                                setValue('neighborhood', '');
                                setValue('city', '');
                                setValue('state', '');
                                clearErrors(['street', 'neighborhood', 'city']);
                              }
                              field.onChange(values.value);
                            }}
                            type='text'
                            placeholder='CEP'
                            format='#####-###'
                            valueIsNumericString={true}
                            className={'form-control rounded'}
                            disabled={loadingCEP}
                            style={{
                              background:
                                invalidZipCode || formWithErros
                                  ? '#ffdada'
                                  : '',
                              cursor: loadingCEP ? 'not-allowed' : 'text',
                            }}
                          />
                        );
                      }}
                    />

                    {loadingCEP && (
                      <div
                        style={{
                          position: 'absolute',
                          right: '20px',
                          top: '50%',
                        }}
                      >
                        <Loader title='' />
                      </div>
                    )}
                  </div>

                  {hasCEP && (
                    <>
                      {/*
                            <div className='input-group'>
                                <div className='area'>
                                <label htmlFor='number'>
                                    <i className='las la-map-marked'></i>
                                </label>
                                <input
                                    type='text'
                                    //value={`${delivery.localidade}/${delivery.uf}`}
                                    className='form-control'
                                    disabled={true}
                                />
                                </div>
                            </div>*/}
                      <span className={styles.text19}>
                        <span>Endereço</span>
                      </span>

                      <div
                        style={{
                          width: '100%',
                        }}
                      >
                        <input
                          {...register('street', {
                            minLength: 3,
                            onChange: (e) => {
                              handleInputStateRequired(
                                'street',
                                e.target.value
                              );
                            },
                          })}
                          // onFocusOut={initiateCart}
                          onBlur={initiateCart}
                          id='street'
                          type='street'
                          placeholder='Endereço'
                          style={{
                            background: Boolean(errors?.street)
                              ? '#ffdada'
                              : '',
                          }}
                          className={'form-control rounded'}
                        />
                      </div>

                      <span className={styles.text19}>
                        <span>Número</span>
                      </span>
                      <div className='input-group '>
                        <input
                          {...register('number_address', {
                            required: 'Digite um número válido',
                            minLength: 1,
                            onChange: (e) =>
                              handleInputStateRequired(
                                'number_address',
                                e.target.value
                              ),
                          })}
                          onBlur={initiateCart}
                          id='number_address'
                          type='text'
                          placeholder='Número'
                          style={{
                            background: errors?.number_address ? '#ffdada' : '',
                          }}
                          className={'form-control rounded'}
                        />
                      </div>
                      <span className={styles.text19}>
                        <span>Bairro</span>
                      </span>

                      <div className='input-group '>
                        <input
                          {...register('neighborhood', {
                            required: true,
                            minLength: 3,
                            onChange: (e) =>
                              handleInputStateRequired(
                                'neighborhood',
                                e.target.value
                              ),
                          })}
                          onBlur={initiateCart}
                          id='neighborhood'
                          type='neighborhood'
                          placeholder='Bairro'
                          defaultValue={delivery?.bairro}
                          style={{
                            background: errors?.neighborhood ? '#ffdada' : '',
                          }}
                          className={'form-control rounded'}
                        />
                      </div>
                      <span className={styles.text19}>
                        <span>Complemento</span>
                      </span>
                      <input
                        type='hidden'
                        id='city'
                        name='city'
                        defaultValue={delivery?.localidade}
                      />
                      <input
                        type='hidden'
                        id='state'
                        name='state'
                        defaultValue={delivery?.uf}
                      />
                      <div className='input-group '>
                        <input
                          {...register('complement', {
                            maxLength: 40,
                            onChange: (e) => {
                              setValue('complement', e.target.value);
                            },
                          })}
                          onBlur={initiateCart}
                          id='complement'
                          type='text'
                          placeholder='Complemento'
                          className={'form-control rounded'}
                          maxLength={40}
                        />
                      </div>
                      {hasFrenet && product.type === 'physical' && (
                        <div className='mb-4 mt-2 w-100'>
                          <span className={styles.text19}>
                            <span>Método de envio</span>
                          </span>
                          {shippingOptions && shippingOptions.length > 0 ? (
                            <div>
                          {shippingOptions.map((option, index) => (
                                <div
                                  key={index}
                                  className='w-100 border p-3 rounded mt-2 d-flex justify-content-between align-items-center'
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    setSelectedOption(index);
                                    tracked('checkout_shipping_method_selected', {
                                      step: 'address',
                                      email: getValues('email'),
                                      phone: getValues('whatsapp'),
                                    });
                                  }}
                                >
                                  <div className='d-flex align-items-center'>
                                    <input
                                      type='radio'
                                      name='shippingOption'
                                      value={option.name}
                                      checked={selectedOption === index}
                                      onChange={() => {
                                        setSelectedOption(index);
                                        tracked(
                                          'checkout_shipping_method_selected',
                                          {
                                            step: 'address',
                                            email: getValues('email'),
                                            phone: getValues('whatsapp'),
                                          }
                                        );
                                      }}
                                      className='mr-2 me-2'
                                    />
                                    <span className={styles.text19}>
                                      {option.label}
                                    </span>
                                  </div>
                                  <span className='Step02_text19__1L5ie ml-5 '>
                                    {currency(option.price)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className='bg-light text-muted mt-3 p-3 rounded'>
                              Preencha seu endereço de entrega para visualizar
                              métodos de entrega.
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  {/* )}   */}
                </div>
              </div>
            </div>
          </div>
        )}
        {(formWithErros || isAnyKeyEmpty) &&
          (offer.require_address ||
            product.type === 'physical' ||
            isObPhysical) && (
            <div className='input-error'>
              Digite corretamente todos os campos para avançar
            </div>
          )}
        <div
          className={styles.frame6}
          onClick={() => handleClick()}
          style={{ cursor: 'pointer' }}
        >
          <span className={styles.text35}>
            <span>Continuar</span>
          </span>
          <img
            src='/external/arrowrighti317-fko.svg'
            alt='arrowrightI317'
            className={styles.arrowright}
          />
        </div>
      </div>
      <div
        className={styles.div01}
        style={{ display: currentStep >= 3 ? '' : 'none' }}
      >
        <div className={styles.frame37254}>
          <div className={styles.frame37253ok}>
            <span className={styles.text08ok}>2</span>
          </div>
          <span className={styles.text09ok}>
            <span>
              Entrega&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          </span>

          {isEditBtn && (
            <div onClick={() => setCurrentStep(2)} className={styles.edit}>
              <img src='/external/edit_icon.png' alt='edit' />
            </div>
          )}
        </div>
        <span className={styles.text11}>
          <span>Dados para entrega.</span>
        </span>
        {offer.require_address ||
        product.type === 'physical' ||
        isObPhysical ? (
          <div>
            <span className={styles.prevTextHeder}>Endereço para entrega:</span>
            <p
              style={{
                fontSize: '0.75rem',
                marginBottom: '0px',
              }}
            >
              <span>{getValues('street')}</span>,{' '}
              <span>{getValues('number_address')}</span> -{' '}
              <span>{getValues('neighborhood')}</span>
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  marginBottom: '0px',
                }}
              >
                {getValues('city')}-{getValues('state')}
              </span>
              <div
                style={{
                  height: '12px',
                  width: '1px',
                  backgroundColor: '#6e6e6e',
                }}
              />
              <span
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  marginBottom: '0px',
                }}
              >
                CEP:{' '}
                {(getValues('zipcode') ?? '').replace(
                  /^(\d{5})(\d{0,3})/,
                  '$1-$2'
                )}
              </span>
            </div>
          </div>
        ) : (
          <div>
            <span className={styles.prevTextHeder}>Não requer endereço</span>
          </div>
        )}
      </div>
      <div
        className={styles.div01}
        style={{ display: currentStep === 1 ? '' : 'none' }}
      >
        <div className={styles.frame37254}>
          <div className={styles.frame37253Unstarted}>
            <span className={styles.text08Unstarted}>2</span>
          </div>
          <span className={styles.text09Unstarted}>
            <span>Endereço de Entrega</span>
          </span>
        </div>
        <span className={styles.text11}>
          <span>
            {offer.require_address ||
            product.type === 'physical' ||
            isObPhysical
              ? 'Digite aqui seu endereço para entrega.'
              : 'Este produto não requer endereço de entrega.'}
          </span>
        </span>
      </div>
    </>
  );
}
