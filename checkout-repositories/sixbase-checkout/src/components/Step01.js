import api from 'api';
import {
  cleanDocument,
  eventKwaiPixel,
  googleAnalyticsSend,
  pixelNative,
  pixelTikTok,
  validateEmail,
  validateName,
  validatePhone,
} from 'functions.js';
import useQuery from 'query/queryHook';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import styles from './Step01.module.css';
import Cookies from 'js-cookie';
import { FormaterPhone } from 'utils/formatPhone';

export function Step01({
  offer,
  setCustomerDataSent,
  fbPixels,
  setFullName,
  uuidOffer,
  product,
  register,
  formState,
  getValues,
  setFocus,
  googlePixels,
  kwaiPixels,
  setCurrentStep,
  currentStep,
  isEditBtn,
  oldCart,
  setValue,
  orderBumps,
  trackEvent,
}) {
  /****************************/

  const query = useQuery();
  const [sentFbPixels, setSentFbPixels] = useState(false);
  const [copyFullName, setCopyFullName] = useState(false);
  const [copyEmail, setCopyEmail] = useState(false);
  const [copyPhone, setCopyPhone] = useState(false);
  const [formWithErrors, setFormWithErrors] = useState(false);
  const [invalidName, setInvalidName] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidNumber, setInvalidNumber] = useState(false);
  const [isObPhysical, setIsObPhysical] = useState(false);
  const startedRef = useRef(false);

  const { errors, isValid } = formState;

  const tracked = (eventName, details) => {
    if (!trackEvent) return;
    trackEvent(eventName, details);
  };

  const initiateCart = async () => {
    if (getValues('full_name') === '') {
      setInvalidName(true);
      return false;
    } else {
      setCopyFullName(getValues('full_name'));
      setInvalidName(false);
    }

    if (getValues('email') === '') {
      setInvalidEmail(true);
      return false;
    } else {
      setCopyEmail(getValues('email'));
      setInvalidEmail(false);
    }

    if (getValues('whatsapp') === '') {
      setInvalidNumber(true);
      return false;
    } else {
      setCopyPhone(getValues('whatsapp'));
      setInvalidNumber(false);
      if (offer.offerShopify && Array.isArray(offer.offerShopify)) {
        googleAnalyticsSend('add_payment_info', {
          currency: 'BRL',
          value: offer.price,
          user_data: {
            email: getValues('email'),
            first_name: getValues('full_name'),
            last_name: '',
            phone: getValues('whatsapp'),
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
    }

    let body = {
      full_name: getValues('full_name'),
      email: getValues('email'),
      document_number: cleanDocument(getValues('document')),
      whatsapp: getValues('whatsapp'),
      offer_uuid: uuidOffer,
      address: {
        zipcode: getValues('zipcode'),
        street: getValues('street'),
        number: getValues('number_address'),
        complement: getValues('complement'),
        neighborhood: getValues('neighborhood'),
        city: getValues('city'),
        state: getValues('state'),
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
          if (fbPixels.length > 0 && Cookies.get('_fbc')) {
            fbPixels.forEach(async (item) => {
              if (item.token) {
                /*await sendApiEvent('AddPaymentInfo', item.pixel_uuid, {
                value: offer.price,
                currency: 'BRL',
                content_ids: [offer.uuid],
                num_items: 1,
              });*/
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
          if (googlePixels.length > 0) {
            googlePixels.forEach(() => {
              if (offer.offerShopify && Array.isArray(offer.offerShopify)) {
                googleAnalyticsSend('add_payment_info', {
                  currency: 'BRL',
                  value: offer.price,
                  user_data: {
                    email: getValues('email'),
                    first_name: getValues('full_name'),
                    last_name: '',
                    phone: getValues('whatsapp'),
                  },
                  items: offer.offerShopify.map((item, index) => ({
                    item_name: item.title,
                    item_id: item.variant_id,
                    index: index,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                  })),
                });
              } else {
                googleAnalyticsSend('add_payment_info', {
                  currency: 'BRL',
                  value: offer.price,
                  items: [{ item_name: offer.product.name }],
                });
              }
            });
          }

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
    if (currentStep === 1 && !startedRef.current) {
      tracked('checkout_identification_started', {
        step: 'identification',
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
      startedRef.current = true;
    }
  }, [currentStep, trackEvent]);

  useEffect(() => {
    setFocus('full_name');
  }, []);

  useEffect(() => {
    if (document.readyState === 'complete') {
      setFocus('email');
    } else {
      window.addEventListener('load', setFocus('email'));
      return () => window.removeEventListener('load', setFocus('email'));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setCustomerDataSent(false);
    } else {
      setCustomerDataSent(true);
    }
  });

  useEffect(() => {
    const ObPhysical =
      orderBumps.filter(
        (item) => item.quantity > 0 && item.product.type === 'physical'
      ).length > 0;
    setIsObPhysical(ObPhysical);
  }, [orderBumps]);

  const [submitted, setSubmitted] = useState(false);

  const handleClick = () => {
    const addressRequired =
      offer.require_address || product.type === 'physical' || isObPhysical;
    const isError = Object.keys(errors).length > 0;

    if (
      !copyFullName ||
      copyFullName === '' ||
      !copyEmail ||
      copyEmail === '' ||
      !copyPhone ||
      copyPhone === '' ||
      isError
    ) {
      setFormWithErrors(true);
      tracked('checkout_identification_error', {
        step: 'identification',
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
    } else {
      setFormWithErrors(false);
      tracked('checkout_identification_filled', {
        step: 'identification',
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
      tracked('checkout_identification_completed', {
        step: 'identification',
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
      if (addressRequired) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
      if (handlePartialValidation()) {
        setSubmitted(true);
      }
    }
    if (googlePixels.length > 0) {
      if (offer.offerShopify && Array.isArray(offer.offerShopify)) {
        googleAnalyticsSend('form_submit', {
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
        googleAnalyticsSend('form_submit', {
          currency: 'BRL',
          value: offer.price,
          items: [{ item_name: offer.product.name }],
        });
      }
    }
  };

  const handleEditClick = () => {
    setCurrentStep(1);
    setSubmitted(false);
  };
  /*************************************************/

  const handlePartialValidation = () => {
    setSubmitted(true);
  };
  /*************************************************/
  let melhorValorChave = '';
  let melhorValor = '';

  if (offer.discounts) {
    melhorValorChave = Object.keys(offer.discounts).reduce((a, b) =>
      offer.discounts[a] > offer.discounts[b] ? a : b
    );
    melhorValor = offer.discounts[melhorValorChave];
    if (melhorValorChave === 'card') {
      melhorValorChave = 'cartão';
    }
    if (melhorValorChave === 'billet') {
      melhorValorChave = 'boleto';
    }
  }

  const hexColor = offer.checkout.hex_color
    ? offer.checkout.hex_color
    : 'var(--hex-color, rgba(248, 107, 134, 1))';

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  useEffect(() => {
    if (oldCart) {
      if (oldCart.full_name) setValue('full_name', oldCart.full_name);
      if (oldCart.email) setValue('email', oldCart.email);
      if (oldCart.whatsapp) setValue('whatsapp', oldCart.whatsapp);
      if (oldCart.document) setValue('document', oldCart.document);
    }
  }, [oldCart]);

  useMemo(() => {
    if (currentStep === 1) return;
    setCopyFullName(getValues('full_name'));
    setCopyEmail(getValues('email'));
    setCopyPhone(getValues('whatsapp'));
    setSubmitted(true);
  }, [currentStep]);

  return (
    <>
      <div
        className={styles.div01}
        style={{
          display: submitted ? 'none' : '',
          '--hex-color': hexColor,
        }}
      >
        <>
          <div className={styles.frame37254}>
            <div className={styles.frame37253}>
              <span className={styles.text08}>1</span>
            </div>
            <span className={styles.text09}>
              <span>Identifique-se</span>
            </span>
          </div>
          <div className={styles.frame37255} style={{ width: '100%' }}>
            <span className={styles.text11} style={{ width: '100%' }}>
              <span>
                Solicitamos apenas informações essenciais para processar a sua
                compra.
              </span>
              {offer.discounts &&
                offer.customizations.show_best_discount === 'true' &&
                melhorValor > 0 && (
                  <>
                    <div
                      className={styles.bestDiscount}
                      style={{ display: submitted ? 'none' : '' }}
                    >
                      <span>
                        Você ganhou{' '}
                        <span className={styles.bestDiscountPercent}>
                          {melhorValor}% de desconto
                        </span>{' '}
                        pagando no {melhorValorChave}
                      </span>
                    </div>
                  </>
                )}
            </span>
            {/*<span className={styles.text13}>
                    <span>
                      Identificar seu perfil, histórico de compra, notificações de
                      pedidos e carrinho de compras.
                    </span>
                  </span>*/}
          </div>
          {/*
                <div className={styles.content}>
                  <div className={styles.tab}>
                    <span className={styles.text15}>
                      <span>Pessoa física</span>
                    </span>
                  </div>
                  <div className={styles.tab1}>
                    <span className={styles.text17}>
                      <span>Pessoa jurídica</span>
                    </span>
                  </div>
                </div>
                */}

          <div className={styles.frame372571}>
            <div className={styles.inputfield}>
              <div className={styles.inputfieldbase}>
                <div className={styles.inputwithlabel}>
                  <span className={styles.text19}>
                    <span>Nome completo</span>
                  </span>
                  {/*
                        <div className={styles.input}>
                          <div className={styles.content1}>
                            <span className={styles.text21}>
                              <span>ex.: Maria de Almeida Cruz</span>
                            </span>
                            
                          </div>
                        </div>*/}

                  <Form.Control
                    {...register('full_name', {
                      required: true,
                      validate: (value) => validateName(value),
                    })}
                    autoComplete='off'
                    className={errors.full_name ? 'is-invalid' : styles.text}
                    id='full_name'
                    placeholder='Digite seu nome completo'
                    type='text'
                    onBlur={initiateCart}
                    style={{
                      background:
                        formWithErrors || invalidName ? '#ffdada' : '',
                    }}
                    onKeyDown={handleKeyPress}
                  />

                  {(errors.full_name || invalidName) && (
                    <div className='input-error'>
                      {errors.full_name?.message || 'Informe seu nome completo'}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.inputfield1}>
              <div className={styles.inputfieldbase1}>
                <div className={styles.inputwithlabel1}>
                  <span className={styles.text23}>
                    <span>Email</span>
                  </span>
                  <Form.Control
                    {...register('email', {
                      required: true,
                      validate: (value) => validateEmail(value),
                    })}
                    onBlur={initiateCart}
                    id='email'
                    autoComplete='off'
                    placeholder='Digite seu e-mail'
                    type='email'
                    className={errors.email ? 'is-invalid' : styles.text}
                    style={{
                      background:
                        formWithErrors || invalidEmail ? '#ffdada' : '',
                    }}
                    onKeyDown={handleKeyPress}
                  />

                  {(errors.email || invalidEmail) && (
                    <div className='input-error'>
                      {errors.email?.message || 'E-mail inválido'}
                    </div>
                  )}
                  {/*<div className={styles.input1}>
                        <div className={styles.content2}>
                            <span className={styles.text25}>
                              <span>ex.: maria@gmail.com</span>
                            </span>
                          </div>
                        </div>*/}
                </div>
              </div>
            </div>
            <div className={styles.inputfield3}>
              <div className={styles.inputfieldbase3}>
                <div className={styles.inputwithlabel3}>
                  <span className={styles.text31}>
                    <span>Celular / WhatsApp</span>
                  </span>
                  <Form.Control
                    {...register('whatsapp', {
                      required: true,
                      validate: (value) => validatePhone(value),
                      onChange: (e) =>
                        setValue('whatsapp', FormaterPhone(e.target.value)),
                    })}
                    onBlur={initiateCart}
                    id='whatsapp'
                    placeholder='WhatsApp'
                    className={errors.email ? 'is-invalid' : styles.text}
                    style={{
                      background:
                        formWithErrors || invalidEmail ? '#ffdada' : '',
                    }}
                    onKeyDown={handleKeyPress}
                  />

                  {(errors.phone_number || invalidNumber) && (
                    <div className='input-error'>
                      {errors.phone_number?.message || 'Telefone inválido'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {formWithErrors && (
            <div className='input-error'>
              Digite corretamente todos os campos para avançar
            </div>
          )}
          <div
            className={styles.buttonGreen}
            onClick={handleClick}
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
        </>
      </div>
      <>
        <div
          className={styles.div01}
          style={{ display: submitted ? '' : 'none' }}
        >
          <div className={styles.frame37254}>
            <div className={styles.frame37253ok}>
              <span className={styles.text08ok}>1</span>
            </div>
            <span className={styles.text09ok}>
              <span>Identifique-se</span>
            </span>
            {isEditBtn && (
              <div onClick={handleEditClick} className={styles.edit}>
                <img src='/external/edit_icon.png' alt='edit' />
              </div>
            )}
          </div>
          <div>
            <div className={styles.text12}>
              <span>
                Solicitamos apenas informações essenciais para processar a sua
                compra.
              </span>
              <br />
              {offer.discounts &&
                offer.customizations.show_best_discount === 'true' &&
                melhorValor > 0 && (
                  <>
                    <div
                      className={styles.bestDiscount}
                      style={{ display: submitted ? 'none' : '' }}
                    >
                      <span>
                        Você ganhou{' '}
                        <span className={styles.bestDiscountPercent}>
                          {melhorValor}% de desconto
                        </span>{' '}
                        pagando no {melhorValorChave}
                      </span>
                    </div>
                  </>
                )}
            </div>
            <div className={styles.wrapPrevInformations}>
              <div className={styles.namePrev}>{getValues('full_name')}</div>
              <div className={styles.emailPrev}>{getValues('email')}</div>
            </div>
          </div>
        </div>
      </>
    </>
  );
}
