import api from 'api';
import cepPromise from 'cep-promise';
import { cnpj, cpf } from 'cpf-cnpj-validator';
import {
  cleanDocument,
  eventKwaiPixel,
  pixelNative,
  pixelTikTok,
  validateEmail,
  validateName,
  validatePhone,
  pushGTMEvent,
} from 'functions.js';
import Cookies from 'js-cookie';
import useQuery from 'query/queryHook';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import InputMask from 'react-input-mask';
import { PatternFormat } from 'react-number-format';
import { calcSummary } from 'SummaryHelpers';
import { verifyRegionByZipcode } from 'utils/findZipcodeRegion';
import { sendApiEvent } from './utils/pixels/facebookAPiConversion';

export default function CheckoutUserData({
  offer,
  oldCart,
  setCustomerDataSent,
  fbPixels,
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
  setLoading,
  clearErrors,
  kwaiPixels,
  totalPrice,
  paymentMethod,
  coupon,
  setTopLevelDelivery,
  handleChangeShipping,
  watch,
  trackEvent,
}) {
  const query = useQuery();
  const [delivery, setDelivery] = useState(null);
  const [isObPhysical, setIsObPhysical] = useState(false);
  const [sentFbPixels, setSentFbPixels] = useState(false);

  const { errors, isValid } = formState;
  const identificationTrackedRef = useRef({
    started: false,
    filled: false,
    completed: false,
    error: false,
  });
  const addressTrackedRef = useRef({
    started: false,
    filled: false,
    completed: false,
    error: false,
  });

  const tracked = (eventName, details) => {
    if (!trackEvent) return;
    trackEvent(eventName, details);
  };

  const watchedIdentification = watch
    ? watch(['full_name', 'email', 'whatsapp', 'document'])
    : [];
  const [watchedName, watchedEmail, watchedPhone, watchedDocument] =
    watchedIdentification;

  const watchedAddress = watch
    ? watch(['zipcode', 'street', 'number_address', 'neighborhood'])
    : [];
  const [watchedZipcode, watchedStreet, watchedNumber, watchedNeighborhood] =
    watchedAddress;

  const isAddressRequired =
    offer?.require_address ||
    product?.type === 'physical' ||
    orderBumps?.some(
      (item) => item.quantity > 0 && item.product.type === 'physical'
    );

  const initiateCart = async () => {
    // if (hasInitiate) return false;
    if (getValues('full_name') === '') {
      return false;
    }
    if (getValues('email') === '') {
      return false;
    }
    const documentValue = getValues('document');
    const isCnpj = getValues('isCnpj') || false;
    if (
      documentValue === '' ||
      !(isCnpj
        ? cnpj.isValid(documentValue.replace(/\D/g, ''))
        : cpf.isValid(documentValue.replace(/\D/g, '')))
    ) {
      return false;
    }
    if (getValues('whatsapp') === '' || !getValues('whatsapp')) {
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
        city: delivery?.localidade,
        state: delivery?.uf,
      },
      params: {},
    };

    if (coupon) {
      const { totalPriceFinal, totalDiscounts } = calcSummary(
        orderBumps,
        totalPrice,
        paymentMethod,
        coupon,
        offer
      );
      body.coupon = {
        code: coupon.coupon,
        id: coupon.id,
        discount: totalDiscounts,
        finalValue: totalPriceFinal,
      };
    }
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
          if (fbPixels.length > 0 && Cookies.get('_fbc')) {
            fbPixels.forEach(async (item) => {
              if (item.token) {
                await sendApiEvent('AddPaymentInfo', item.pixel_uuid, {
                  value: offer.price,
                  currency: 'BRL',
                  content_ids: [offer.uuid],
                  num_items: 1,
                });
              }
            });
          }
          if (fbPixels.length > 0 && !sentFbPixels) {
            pixelNative('AddPaymentInfo', {
              value: offer.price,
              currency: 'BRL',
              content_ids: [offer.uuid],
              num_items: 1,
            });
            setSentFbPixels(true);
            pixelTikTok('AddPaymentInfo');
          }
          /*if (googlePixels.length > 0) {
            googlePixels.forEach(() => {
              googleAnalyticsSend('add_payment_info', {
                currency: 'BRL',
                value: offer.price,
                items: [{ item_name: offer.product.name }],
              });
            });
          }*/
          pushGTMEvent('add_payment_info', {
            currency: 'BRL',
            value: offer.price,
            payment_type: paymentMethod, // card | pix | billet
            items: [
              {
                item_name: offer.product.name,
                item_id: offer.product.uuid,
                price: offer.price,
                quantity: 1,
              },
            ],
          });

          if (kwaiPixels.length > 0) {
            kwaiPixels.forEach((element) => {
              eventKwaiPixel({
                event: 'add_payment_info',
                pixel_id: element.settings.pixel_id,
                body: {
                  value: offer.price,
                  name: offer.product.name,
                },
              });
            });
          }
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
    if (coupon) initiateCart();
  }, [coupon]);

  useEffect(() => {
    if (!identificationTrackedRef.current.started) {
      tracked('checkout_identification_started', {
        step: 'identification',
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
      identificationTrackedRef.current.started = true;
    }
  }, [trackEvent]);

  useEffect(() => {
    const hasIdentificationErrors =
      errors?.full_name ||
      errors?.email ||
      errors?.whatsapp ||
      errors?.document;

    if (hasIdentificationErrors && !identificationTrackedRef.current.error) {
      tracked('checkout_identification_error', {
        step: 'identification',
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
      identificationTrackedRef.current.error = true;
    }

    if (!hasIdentificationErrors) {
      identificationTrackedRef.current.error = false;
    }
  }, [errors, trackEvent]);

  useEffect(() => {
    const identificationValid =
      Boolean(watchedName) &&
      Boolean(watchedEmail) &&
      Boolean(watchedPhone) &&
      Boolean(watchedDocument) &&
      !errors?.full_name &&
      !errors?.email &&
      !errors?.whatsapp &&
      !errors?.document;

    if (identificationValid && !identificationTrackedRef.current.filled) {
      tracked('checkout_identification_filled', {
        step: 'identification',
        email: watchedEmail,
        phone: watchedPhone,
      });
      tracked('checkout_identification_completed', {
        step: 'identification',
        email: watchedEmail,
        phone: watchedPhone,
      });
      identificationTrackedRef.current.filled = true;
      identificationTrackedRef.current.completed = true;
    }
  }, [
    watchedName,
    watchedEmail,
    watchedPhone,
    watchedDocument,
    errors,
    trackEvent,
  ]);

  useEffect(() => {
    if (!isAddressRequired) return;

    const hasAnyAddressValue =
      Boolean(watchedZipcode) ||
      Boolean(watchedStreet) ||
      Boolean(watchedNumber) ||
      Boolean(watchedNeighborhood);

    if (hasAnyAddressValue && !addressTrackedRef.current.started) {
      tracked('checkout_address_started', {
        step: 'address',
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
      addressTrackedRef.current.started = true;
    }
  }, [
    isAddressRequired,
    watchedZipcode,
    watchedStreet,
    watchedNumber,
    watchedNeighborhood,
    trackEvent,
  ]);

  useEffect(() => {
    if (!isAddressRequired) return;

    const hasAddressErrors =
      errors?.zipcode ||
      errors?.street ||
      errors?.number_address ||
      errors?.neighborhood;

    if (hasAddressErrors && !addressTrackedRef.current.error) {
      tracked('checkout_address_error', {
        step: 'address',
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
      addressTrackedRef.current.error = true;
    }

    if (!hasAddressErrors) {
      addressTrackedRef.current.error = false;
    }
  }, [errors, isAddressRequired, trackEvent]);

  useEffect(() => {
    if (!isAddressRequired) return;

    const addressValid =
      Boolean(watchedZipcode) &&
      Boolean(watchedStreet) &&
      Boolean(watchedNumber) &&
      Boolean(watchedNeighborhood) &&
      !errors?.zipcode &&
      !errors?.street &&
      !errors?.number_address &&
      !errors?.neighborhood;

    if (addressValid && !addressTrackedRef.current.filled) {
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
      addressTrackedRef.current.filled = true;
      addressTrackedRef.current.completed = true;
    }
  }, [
    isAddressRequired,
    watchedZipcode,
    watchedStreet,
    watchedNumber,
    watchedNeighborhood,
    errors,
    trackEvent,
  ]);

  useEffect(() => {
    // Pré-preencher apenas com valores da query string se existirem
    if (query.get('full_name')) {
      setValue('full_name', query.get('full_name'));
    }
    if (query.get('email')) {
      setValue('email', query.get('email'));
    }
    if (query.get('phone')) {
      const phoneValue = query.get('phone');
      const digits = phoneValue.replace(/\D/g, '');
      setValue('whatsapp', digits);
    }
    if (query.get('zipcode')) {
      const zipcode = query.get('zipcode');
      setValue('zipcode', zipcode);
      getDelivery(zipcode);
    }

    setFocus('full_name');
  }, []);

  useEffect(() => {
    if (oldCart) {
      if (oldCart.full_name) setValue('full_name', oldCart.full_name);
      if (oldCart.email) setValue('email', oldCart.email);
      if (oldCart.document_number)
        setValue('document', oldCart.document_number);
      if (oldCart.whatsapp) setValue('whatsapp', oldCart.whatsapp);

      if (oldCart.address?.zipcode) {
        setValue('zipcode', oldCart.address.zipcode);
        getDelivery(oldCart.address?.zipcode);
      }
      if (oldCart.address?.street) {
        setValue('street', oldCart.address.street);
      }
      if (oldCart.address?.number) {
        setValue('number_address', oldCart.address.number);
      }
      if (oldCart.address?.complement) {
        setValue('complement', oldCart.address.complement);
      }
      if (oldCart.address?.neighborhood) {
        setValue('neighborhood', oldCart.address.neighborhood);
      }
    }
  }, [oldCart]);

  const getDelivery = (cep) => {
    setLoading(true);
    cepPromise(cep)
      .then((r) => {
        setDelivery({ ...r, uf: r.state, localidade: r.city });
        setTopLevelDelivery({ ...r, uf: r.state, localidade: r.city });
        setValue('street', r.street);
        setValue('neighborhood', r.neighborhood);

        clearErrors('zipcode');
        if (Object.keys(offer.shipping_by_region).length !== 0) {
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
        /*if (googlePixels.length > 0) {
          googlePixels.forEach(() => {
            googleAnalyticsSend('add_shipping_info', {
              currency: 'BRL',
              value: offer.price,
              items: [{ item_name: offer.product.name }],
            });
          });
        }*/
        pushGTMEvent('add_shipping_info', {
          currency: 'BRL',
          value: offer.price,
          items: [
            {
              item_name: offer.product.name,
              item_id: offer.product.uuid,
              price: offer.price,
              quantity: 1,
            },
          ],
          shipping_tier: delivery?.uf || 'BR',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const ObPhysical =
      orderBumps.filter(
        (item) => item.quantity > 0 && ['physical'].includes(item.product.type)
      ).length > 0;
    setIsObPhysical(ObPhysical);
    if (!ObPhysical) {
      clearErrors('zipcode');
    }

    if (product.type !== 'physical') {
      if (
        orderBumps.filter(
          (item) =>
            item.quantity > 0 && ['physical'].includes(item.product.type)
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

  return (
    <div className='personal-info'>
      <Row g='1'>
        {/*    <Col xs={12}>
          <div className='d-flex residente'>
            <span>
              <input
                id='residenteBrasil'
                name='residente'
                type='radio'
                value='brasil'
                defaultChecked
                onChange={() => {
                  setResident('brasil');
                }}
              />
              <label htmlFor='residenteBrasil'>Resido no Brasil</label>
            </span>
            <span>
              <input
                id='residenteExterior'
                name='residente'
                type='radio'
                value='exterior'
                onChange={() => {
                  setResident('exterior');
                }}
              />
              <label htmlFor='residenteExterior'>Resido no exterior</label>
            </span>
          </div>
        </Col> */}
        <Col md={6}>
          <div className='input-group mb-3'>
            <div className='area'>
              <label htmlFor='full_name'>
                <i className='las la-user'></i>
              </label>
              <Form.Control
                {...register('full_name', {
                  required: true,
                  validate: (value) => validateName(value),
                })}
                autoComplete='off'
                className={errors.full_name ? 'is-invalid' : ''}
                id='full_name'
                placeholder='Digite seu nome completo'
                type='text'
                onBlur={initiateCart}
              />
              {errors.full_name && (
                <div className='input-error'>
                  {errors.full_name.message || 'Nome inválido'}
                </div>
              )}
            </div>
          </div>
        </Col>
        <Col md={6}>
          <div className='input-group mb-3'>
            <div className='area'>
              <label htmlFor='email'>
                <i className='las la-envelope'></i>
              </label>
              <Form.Control
                {...register('email', {
                  required: true,
                  validate: (value) => {
                    const isValid = validateEmail(value);
                    if (!isValid) {
                      return isValid;
                    }
                    const values = value.split('@');
                    const [, provider] = values;
                    const splitedProvider = provider.split('.');
                    return !splitedProvider.includes('con');
                  },
                })}
                onBlur={initiateCart}
                id='email'
                autoComplete='off'
                placeholder='Digite seu e-mail'
                type='email'
                className={errors.email ? 'is-invalid' : ''}
              />
              {errors.email && (
                <div className='input-error'>E-mail inválido</div>
              )}
            </div>
          </div>
        </Col>
        {!offer.cpf_bottom && (
          <Col md={6}>
            <div className='input-group mb-3'>
              <div className='area' style={{ position: 'relative' }}>
                <label htmlFor='cpf'>
                  <i className='las la-address-card' />
                </label>

                <InputMask
                  {...register('document', {
                    required: true,
                    validate: (value) => {
                      if (!value) return false;
                      const cleanValue = value.replace(/\D/g, '');
                      const isCnpj = getValues('isCnpj') || false;
                      const isValid = isCnpj
                        ? cnpj.isValid(cleanValue)
                        : cpf.isValid(cleanValue);
                      return isValid;
                    },
                  })}
                  onBlur={initiateCart}
                  autoComplete='off'
                  id='cpf'
                  type='tel'
                  placeholder={getValues('isCnpj') ? 'CNPJ' : 'CPF'}
                  mask={
                    getValues('isCnpj')
                      ? '99.999.999/9999-99'
                      : '999.999.999-99'
                  }
                  className={
                    errors.document ? 'form-control is-invalid' : 'form-control'
                  }
                />
                {offer.show_cnpj && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '11px',
                      right: '10px',
                      display: 'flex',
                      gap: '4px',
                    }}
                  >
                    <span style={{ display: 'block', fontSize: '0.75rem' }}>
                      CNPJ
                    </span>
                    <input
                      className='cnpj-checkbox'
                      type='checkbox'
                      onChange={(e) => {
                        setValue('document', '', { shouldValidate: true });
                        setValue('isCnpj', e.target.checked, {
                          shouldValidate: true,
                        });
                      }}
                    />
                  </div>
                )}

                {errors.document && (
                  <div className='input-error'>
                    {getValues('isCnpj') ? 'CNPJ inválido' : 'CPF inválido'}
                  </div>
                )}
              </div>
            </div>
          </Col>
        )}
        <Col md={6}>
          <div className='input-group mb-3'>
            <div className='area'>
              <label htmlFor='whatsapp'>
                <i className='la la-whatsapp'></i>
              </label>

              <Controller
                name='whatsapp'
                control={control}
                rules={{
                  required: true,
                  validate: (value) => validatePhone(value),
                }}
                render={({ field: { onChange, onBlur, value = '' } }) => {
                  const numericValue = value.replace(/\D/g, '');
                  const mask = useMemo(() => {
                    return numericValue.length > 10
                      ? '(99) 99999-9999'
                      : '(99) 9999-9999';
                  }, [numericValue.length]);

                  const [currentMask, setCurrentMask] = useState(mask);

                  useEffect(() => {
                    if (mask !== currentMask) {
                      setCurrentMask(mask);
                    }
                  }, [mask, currentMask]);

                  const handleInput = (e) => {
                    const rawValue = e.target.value;
                    const numeric = rawValue.replace(/\D/g, '');

                    if (
                      numeric.length > 10 &&
                      currentMask !== '(99) 99999-9999'
                    ) {
                      setCurrentMask('(99) 99999-9999');
                      setTimeout(() => {
                        onChange(rawValue);
                      }, 0);
                    } else if (
                      numeric.length <= 10 &&
                      currentMask !== '(99) 9999-9999'
                    ) {
                      setCurrentMask('(99) 9999-9999');
                      setTimeout(() => {
                        onChange(rawValue);
                      }, 0);
                    } else {
                      onChange(rawValue);
                    }
                  };

                  return (
                    <InputMask
                      mask={currentMask}
                      value={value}
                      maskChar={null}
                      onInput={handleInput}
                      onBlur={(e) => {
                        initiateCart();
                        onBlur(e);
                      }}
                      id='whatsapp'
                      name='whatsapp'
                      className={
                        errors.whatsapp
                          ? 'form-control is-invalid'
                          : 'form-control'
                      }
                      placeholder='WhatsApp'
                    />
                  );
                }}
              />
              {errors.whatsapp && (
                <div className='input-error'>Telefone inválido</div>
              )}
            </div>
          </div>
        </Col>
        {(offer.require_address ||
          product.type === 'physical' ||
          isObPhysical) && (
          <>
            <Col md={6} className='mb-3'>
              <div className='input-group'>
                <div className='area'>
                  <label htmlFor='zipcode'>
                    <i className='las la-box'></i>
                  </label>
                  <Controller
                    name='zipcode'
                    control={control}
                    rules={{
                      required:
                        offer.require_address ||
                        product.type === 'physical' ||
                        isObPhysical,
                    }}
                    render={({ field }) => (
                      <PatternFormat
                        onBlur={initiateCart}
                        value={field.value}
                        onValueChange={(values) => {
                          if (values.value.length === 8) {
                            getDelivery(values.value);
                          }
                          field.onChange(values.value);
                        }}
                        type='text'
                        placeholder='CEP'
                        format='#####-###'
                        valueIsNumericString={true}
                        className={
                          errors.cep
                            ? 'form-control is-invalid'
                            : 'form-control'
                        }
                      />
                    )}
                  />
                  {errors.zipcode && (
                    <div className='input-error'>
                      Por favor, digite um CEP válido
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {delivery && (
              <>
                <Col md={6} className='d-flex mb-3'>
                  <div className='input-group'>
                    <div className='area'>
                      <label htmlFor='number'>
                        <i className='las la-map-marked'></i>
                      </label>
                      <input
                        type='text'
                        value={`${delivery.localidade}/${delivery.uf}`}
                        className='form-control'
                        disabled={true}
                      />
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className='input-group mb-3'>
                    <div className='area'>
                      <label htmlFor='street'>
                        <i className='las la-road'></i>
                      </label>
                      <input
                        {...register('street', {
                          minLength: 3,
                          message: 'Digite um endereço válido',
                          required: true,
                        })}
                        // onFocusOut={initiateCart}
                        onBlur={initiateCart}
                        id='street'
                        type='street'
                        placeholder='Endereço'
                        defaultValue={delivery?.logradouro}
                        className={
                          errors.street
                            ? 'form-control is-invalid'
                            : 'form-control'
                        }
                      />
                      <div className='input-error'>
                        {errors?.street && errors?.street?.message}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className='input-group mb-3'>
                    <div className='area'>
                      <label htmlFor='number_address'>
                        <i className='las la-home'></i>
                      </label>
                      <input
                        {...register('number_address', {
                          required: 'Digite um número válido',
                        })}
                        onBlur={initiateCart}
                        id='number_address'
                        type='text'
                        placeholder='Número'
                        className={
                          errors.number_address
                            ? 'form-control is-invalid'
                            : 'form-control'
                        }
                      />
                      <div className='input-error'>
                        {errors?.number_address &&
                          errors?.number_address?.message}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className='input-group mb-3'>
                    <div className='area'>
                      <label htmlFor='neighborhood'>
                        <i className='las la-city'></i>
                      </label>
                      <input
                        {...register('neighborhood', {
                          required: true,
                          minLength: 3,
                        })}
                        onBlur={initiateCart}
                        id='neighborhood'
                        type='neighborhood'
                        placeholder='Bairro'
                        defaultValue={delivery?.bairro}
                        className={
                          errors.neighborhood
                            ? 'form-control is-invalid'
                            : 'form-control'
                        }
                      />
                      <div className='input-error'>
                        {errors?.neighborhood && errors?.neighborhood?.message}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className='input-group mb-3'>
                    <div className='area'>
                      <label htmlFor='complement'>
                        <i className='las la-street-view'></i>
                      </label>
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
                        maxLength={40}
                        className={
                          errors.complement
                            ? 'form-control is-invalid'
                            : 'form-control'
                        }
                      />
                      <div className='input-error'>
                        {errors?.complement && errors?.complement?.message}
                      </div>
                    </div>
                  </div>
                </Col>
              </>
            )}
          </>
        )}
      </Row>
    </div>
  );
}
