import { cnpj, cpf } from 'cpf-cnpj-validator';
import { currency } from 'functions';
import { googleAnalyticsSend } from 'functions.js';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import InputMask from 'react-input-mask';
import { NumericFormat } from 'react-number-format';
import styles from './Step04.module.css';
import { FormatterCpf } from 'utils/formater-cpf';
import { FormatterCnpj } from 'utils/formater-cnpj';
import '../../src/styles/checkout3steps.scss';
import { calcSummary, parsePrice } from 'SummaryHelpers';

// Função PMT para cálculo de parcelamento com juros
const PMT = (ir, np, pv, fv = 0, type = 0) => {
  let pmt;
  const pvif = Math.pow(1 + ir, np);
  pmt = (-ir * (pv * pvif + fv)) / (pvif - 1);
  if (type === 1) pmt /= 1 + ir;
  return pmt;
};

// Função para calcular lista de parcelas baseada no valor do cartão
const calculateCardInstallmentsList = (
  cardAmount,
  max_installments,
  student_pays_interest,
  installments_fee
) => {
  const list = [];
  list.push({
    n: 1,
    price: cardAmount,
    total: cardAmount,
  });

  if (student_pays_interest) {
    for (let installment = 2; installment <= max_installments; installment += 1) {
      const pmt = PMT(installments_fee / 100, installment, cardAmount);
      const total = Math.abs(pmt) * installment;
      const installment_price = total / installment;
      list.push({
        n: installment,
        price: installment_price,
        total,
      });
    }
  } else {
    for (let installment = 2; installment <= max_installments; installment += 1) {
      const total = cardAmount;
      const installment_price = total / installment;
      list.push({
        n: installment,
        price: installment_price,
        total,
      });
    }
  }
  return list;
};

export function Step04({
  paymentMethod,
  setPaymentMethod,
  allowedCard,
  allowedPix,
  allowedBillet,
  orderBumps,
  offer,
  obComponent,
  BuyButtonComponent,
  register,
  errors,
  installmentsList,
  getValues,
  setCurrentInstallment,
  setValue,
  currentStep,
  isMobile,
  setError,
  clearErrors,
  googlePixels,
  showCpf,
  paymentType,
  setPaymentType,
  totalPrice,
  coupon,
  watch,
  selectedShipping,
  hasFrenet,
  shippingChanged,
  trackEvent,
}) {
  const useTwoCards = paymentMethod === 'two_cards';
  const paymentDataStartedRef = useRef(false);
  const paymentErrorRef = useRef(false);

  // State para controlar os valores dos inputs diretamente
  const [card1AmountValue, setCard1AmountValue] = useState('');
  const [card2AmountValue, setCard2AmountValue] = useState('');
  const [amountErrors, setAmountErrors] = useState({});

  // Refs para controlar atualizações e evitar loops
  const initializedRef = useRef(false);
  const isUpdatingRef = useRef(false);
  const lastCard1ValueRef = useRef('');

  // Observar valores dos cartões para recalcular parcelamento
  const card1Amount = watch('card1_amount');
  const card2Amount = watch('card2_amount');

  // Função auxiliar para parse de valores
  const parseAmount = useCallback((value) => {
    if (!value || typeof value !== 'string') return 0;
    const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned || 0);
  }, []);

  const tracked = (eventName, details) => {
    if (!trackEvent) return;
    trackEvent(eventName, details);
  };

  // Calcular shippingCost exatamente como no Summary3Steps para garantir consistência
  const shippingCost = useMemo(() => {
    if (!offer) return 0;
    // Mesma lógica do Summary3Steps
    const selectedShippingPrice = parsePrice(selectedShipping?.price ?? 0);
    const cost = offer.shipping_type === 0 || !!coupon?.free_shipping
      ? 0
      : hasFrenet
        ? selectedShippingPrice
        : parsePrice(offer.shipping_price || 0);

    return cost;
  }, [offer, coupon, hasFrenet, selectedShipping?.price, shippingChanged, offer.shipping_price]);

  // Calcular totalPriceFinal exatamente como no Summary3Steps
  // Adicionando shippingChanged e outros como dep direta para garantir re-cálculo
  const totalPriceFinal = useMemo(() => {
    if (!offer) return 0;

    // Usar 'card' como paymentMethod para cálculo de desconto quando for two_cards
    const paymentMethodForDiscount = paymentMethod === 'two_cards' ? 'card' : paymentMethod;

    // Mesmo cálculo do Summary3Steps
    const { totalPriceFinal: calculatedTotal } = calcSummary(
      orderBumps,
      totalPrice,
      paymentMethodForDiscount,
      coupon,
      offer,
      shippingCost
    );

    return calculatedTotal;
  }, [offer, orderBumps, totalPrice, paymentMethod, coupon, shippingCost, shippingChanged]);

  const handleDivClickCard = () => {
    setPaymentMethod('card');
    tracked('checkout_payment_method_selected', {
      step: 'payment',
      paymentMethod: 'credit_card',
      email: getValues('email'),
      phone: getValues('whatsapp'),
    });
  };
  const handleDivClickBillet = () => {
    setPaymentMethod('billet');
    tracked('checkout_payment_method_selected', {
      step: 'payment',
      paymentMethod: 'boleto',
      email: getValues('email'),
      phone: getValues('whatsapp'),
    });
  };
  const handleDivClickPix = () => {
    setPaymentMethod('pix');
    tracked('checkout_payment_method_selected', {
      step: 'payment',
      paymentMethod: 'pix',
      email: getValues('email'),
      phone: getValues('whatsapp'),
    });
    if (googlePixels.length > 0) {
      if (offer.offerShopify && Array.isArray(offer.offerShopify)) {
        googleAnalyticsSend('add_payment_info', {
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
      } else {
        googleAnalyticsSend('add_payment_info', {
          currency: 'BRL',
          value: offer.price,
          items: [{ item_name: offer.product.name }],
        });
      }
    }
  };

  useEffect(() => {
    if (currentStep === 3 && !paymentDataStartedRef.current) {
      tracked('checkout_payment_data_started', {
        step: 'payment',
        paymentMethod:
          paymentMethod === 'pix'
            ? 'pix'
            : paymentMethod === 'billet'
              ? 'boleto'
              : 'credit_card',
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
      paymentDataStartedRef.current = true;
    }
  }, [currentStep, paymentMethod, trackEvent]);

  useEffect(() => {
    if (currentStep !== 3) return;
    const hasPaymentErrors =
      errors?.number ||
      errors?.expiry ||
      errors?.cvc ||
      errors?.cardHolder ||
      errors?.document ||
      errors?.installments ||
      errors?.card1_amount ||
      errors?.card2_amount ||
      errors?.cards_sum_error;

    if (hasPaymentErrors && !paymentErrorRef.current) {
      tracked('checkout_payment_data_error', {
        step: 'payment',
        paymentMethod:
          paymentMethod === 'pix'
            ? 'pix'
            : paymentMethod === 'billet'
              ? 'boleto'
              : 'credit_card',
        email: getValues('email'),
        phone: getValues('whatsapp'),
      });
      paymentErrorRef.current = true;
    }

    if (!hasPaymentErrors) {
      paymentErrorRef.current = false;
    }
  }, [currentStep, errors, paymentMethod, trackEvent]);

  const handleInputStateRequired = (key, value) => {
    setValue(key, value);
    Boolean(value)
      ? clearErrors(key)
      : setError(key, {
        message: 'campo obrigatório',
      });
  };

  // Ref para armazenar o último totalPriceFinal usado
  const lastTotalPriceFinalRef = useRef(0);

  // Validar soma dos cartões
  const validateCardsSum = useCallback(() => {
    if (useTwoCards && totalPriceFinal && !isUpdatingRef.current) {
      const amount1 = getValues('card1_amount') || '';
      const amount2 = getValues('card2_amount') || '';
      const sum = parseAmount(amount1) + parseAmount(amount2);
      const diff = Math.abs(sum - totalPriceFinal);

      if (diff > 0.01) {
        setError('cards_sum_error', {
          type: 'manual',
          message: 'A soma dos valores dos cartões deve ser igual ao total da compra',
        });
      } else {
        setValue('cards_sum_error', false, { shouldValidate: false });
        clearErrors('cards_sum_error');
      }
    }
  }, [useTwoCards, totalPriceFinal, setError, clearErrors, getValues, setValue, parseAmount]);

  // Inicializar e atualizar valores quando dois cartões são ativados ou quando totalPriceFinal muda (ex: frete)
  useEffect(() => {
    if (useTwoCards && totalPriceFinal && totalPriceFinal > 0) {
      const prevTotal = lastTotalPriceFinalRef.current;
      const hasChanged = Math.abs(prevTotal - totalPriceFinal) > 0.01;
      const isInitializing = !initializedRef.current;

      // Se é a primeira vez OU se o totalPriceFinal mudou de forma significativa
      if (isInitializing || hasChanged) {
        isUpdatingRef.current = true;
        lastTotalPriceFinalRef.current = totalPriceFinal;

        let card1Value, card2Value;

        if (isInitializing) {
          // Primeira vez: inicializar 50/50
          card1Value = Math.min(totalPriceFinal - 2, Math.floor(totalPriceFinal / 2));
          card2Value = totalPriceFinal - card1Value;
        } else {
          // Total mudou: manter proporção se possível, senão 50/50
          const currentCard1Amount = getValues('card1_amount') || card1AmountValue || '';
          const currentCard1Value = parseAmount(currentCard1Amount);

          if (currentCard1Value > 0 && prevTotal > 0) {
            // Manter proporção
            const proportion = currentCard1Value / prevTotal;
            card1Value = Math.min(totalPriceFinal - 2, Math.max(2, totalPriceFinal * proportion));
            card2Value = totalPriceFinal - card1Value;
          } else {
            // Se não tem valor válido, inicializar 50/50
            card1Value = Math.min(totalPriceFinal - 2, Math.floor(totalPriceFinal / 2));
            card2Value = totalPriceFinal - card1Value;
          }
        }

        const card1Formatted = `R$ ${card1Value.toFixed(2).replace('.', ',')}`;
        const card2Formatted = `R$ ${card2Value.toFixed(2).replace('.', ',')}`;

        setCard1AmountValue(card1Formatted);
        setCard2AmountValue(card2Formatted);
        lastCard1ValueRef.current = card1Formatted;

        setValue('card1_amount', card1Formatted, { shouldValidate: false });
        setValue('card2_amount', card2Formatted, { shouldValidate: false });

        if (isInitializing) {
          setValue('installments', 1, { shouldValidate: false });
          setValue('2_installments', 1, { shouldValidate: false });
        }

        setTimeout(() => {
          isUpdatingRef.current = false;
          initializedRef.current = true;
          validateCardsSum();
        }, 100);
      }
    } else if (!useTwoCards && lastTotalPriceFinalRef.current !== 0) {
      // Limpar quando sair do modo dois cartões
      setCard1AmountValue('');
      setCard2AmountValue('');
      initializedRef.current = false;
      lastTotalPriceFinalRef.current = 0;
    }
  }, [useTwoCards, totalPriceFinal, setValue, getValues, parseAmount, validateCardsSum]);

  // Limpar campos do segundo cartão quando desativar 2 cartões
  useEffect(() => {
    if (!useTwoCards && clearErrors) {
      setValue('2_number', '');
      setValue('2_cardHolder', '');
      setValue('2_expiry', '');
      setValue('2_cvc', '');
      setValue('2_installments', '');
      setValue('card2_amount', '');
      clearErrors('2_number');
      clearErrors('2_cardHolder');
      clearErrors('2_expiry');
      clearErrors('2_cvc');
      clearErrors('2_installments');
      clearErrors('card2_amount');
    }
  }, [useTwoCards, setValue, clearErrors]);

  const handleValidateCardFields = () => {
    clearErrors();

    if (useTwoCards) {
      const keys = ['number', 'cvc', 'expiry', 'cardHolder', '2_number', '2_cvc', '2_expiry', '2_cardHolder', 'document'];
      const values = getValues(keys);
      values.forEach((value, i) => {
        if (!Boolean(value)) {
          setError(keys[i], { message: 'campo obrigatório' });
        }
      });
      validateCardsSum();
    } else {
      const keys = ['number', 'cvc', 'expiry', 'cardHolder', 'document'];
      const values = getValues(keys);
      values.forEach((value, i) => {
        if (!Boolean(value)) {
          setError(keys[i], { message: 'campo obrigatório' });
        }
      });
    }
  };

  const handleValidatePixAndBankSlipFields = () => {
    clearErrors();

    const value = getValues('document');

    if (Boolean(value)) return;

    setError('document', { message: 'campo obrigatório' });
  };

  useEffect(() => {
    if (currentStep !== 3) return;

    if (paymentMethod === 'card' || paymentMethod === 'two_cards') {
      handleValidateCardFields();
      return;
    }

    handleValidatePixAndBankSlipFields();
  }, [paymentMethod, currentStep]);

  const hexColor = offer.checkout.hex_color
    ? offer.checkout.hex_color
    : 'var(--hex-color, rgba(248, 107, 134, 1))';

  return (
    <>
      <div
        className={styles.div01}
        style={{
          display: currentStep === 3 ? '' : 'none',
          '--hex-color': hexColor,
        }}
      >
        <div className={styles.frame37254}>
          <div className={styles.frame37253}>
            <span className={styles.text08}>3</span>
          </div>
          <span className={styles.text09}>
            <span>Pagamento</span>
          </span>
        </div>
        {allowedCard && (
          <div
            className={styles.checkboxgroupitem}
            onClick={handleDivClickCard}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.checkbox}>
              <div className={styles.input}>
                <div className={styles.checkbox1}>
                  <input
                    type='radio'
                    id='radio-card'
                    name='payment-method'
                    className={
                      paymentMethod === 'card' ? 'radio active' : 'radio'
                    }
                    checked={paymentMethod === 'card'}
                    onChange={() => {
                      setPaymentMethod('card');
                    }}
                  />
                </div>
              </div>
              <div className={styles.textandsupportingtext}>
                <div className={styles.text}>Cartão de Crédito</div>
                <div className={styles.creditCardDiv}>
                  <img
                    src='/external/paymentmethodslightvisa3203-l31s.svg'
                    alt=''
                    className={styles.cardCredit1}
                  />
                  <img
                    src='/external/paymentmethodslightmastercard3203-sf1i.svg'
                    alt=''
                    className={styles.cardCredit1}
                  />
                  <img
                    src='/external/paymentmethodslightamericanexpress3203-2jw4.svg'
                    alt=''
                    className={styles.cardCredit1}
                  />
                  <img
                    src='/external/paymentmethodslightdinersclub3203-nqz8.svg'
                    alt=''
                    className={styles.cardCredit1}
                  />
                  <img
                    src='/external/paymentmethodslighthipercard3203-5i8.svg'
                    alt=''
                    className={styles.cardCredit1}
                  />
                  <img
                    src='/external/paymentmethodslightelo3203-zmb.svg'
                    alt=''
                    className={styles.cardCredit1}
                  />
                </div>
                <div className={styles.supportingtext}>
                  {installmentsList && installmentsList.length
                    ? `Em até ${installmentsList.length}x`
                    : 'Sem parcelas disponíveis'}
                </div>
              </div>
              {/*TODO*/}
              {/* <div className={styles.text1}>{currency(totalPriceFinal)}</div> */}
            </div>
          </div>
        )}
        {/* TODO: Atualizar valor mínimo para R$ 100 quando necessário */}
        {offer?.enable_two_cards_payment &&
          allowedCard &&
          totalPriceFinal >= 10 && (
            <div
              className={styles.checkboxgroupitem}
              onClick={() => setPaymentMethod('two_cards')}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.checkbox}>
                <div className={styles.input}>
                  <div className={styles.checkbox1}>
                    <input
                      type='radio'
                      id='radio-two-cards'
                      name='payment-method'
                      className={
                        paymentMethod === 'two_cards' ? 'radio active' : 'radio'
                      }
                      checked={paymentMethod === 'two_cards'}
                      onChange={() => {
                        setPaymentMethod('two_cards');
                      }}
                    />
                  </div>
                </div>
                <div className={styles.textandsupportingtext}>
                  <div className={styles.text}>
                    <i
                      className='las la-credit-card'
                      style={{ marginRight: '8px' }}
                    />
                    Dois cartões
                  </div>
                  <div className={styles.supportingtext}>
                    {installmentsList && installmentsList.length
                      ? `Em até ${installmentsList.length}x`
                      : 'Sem parcelas disponíveis'}
                  </div>
                </div>
              </div>
            </div>
          )}
        {(paymentMethod === 'card' || paymentMethod === 'two_cards') && (
          <>
            {useTwoCards && (
              <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                <h5 style={{ fontSize: '1rem', fontWeight: '600', margin: '0' }}>Cartão 1</h5>
              </div>
            )}
            <div className='input-group mb-2'>
              <div className='input-group mb-2'>
                <span className={styles.text19}>
                  <span>Número do Cartão</span>
                </span>
              </div>

              <InputMask
                {...register('number', {
                  required: {
                    value: paymentMethod === 'card' || paymentMethod === 'two_cards',
                    message: 'Informe um número válido',
                  },
                  validate: (value) => {
                    if (value.replace(/\D/g, '').length < 15) {
                      setError('card', { message: 'Informe um número válido' });
                    }

                    return value.replace(/\D/g, '').length >= 15;
                  },
                })}
                autoComplete='cc-number'
                id='number'
                type='tel'
                placeholder='Digite somente os Números'
                mask='9999 9999 9999 999999'
                maskChar=''
                onChange={(e) => {
                  if (e.target.value.replace(/\D/g, '').length < 14) {
                    setError('number', { message: 'Informe um número válido' });
                    return;
                  }
                  handleInputStateRequired('number', e.target.value);
                }}
                style={{
                  background: errors?.number ? '#ffdada' : '',
                }}
                className={'form-control steps rounded'}
              />
            </div>
            <div className='row justify-content-evenly'>
              <div className='col-6'>
                <>
                  <div className='input-group mb-2'>
                    <span className={styles.text19}>
                      <span>Validade </span>
                    </span>
                  </div>
                  <div className='input-group mb-2'>
                    <InputMask
                      {...register('expiry', {
                        required: {
                          value: paymentMethod === 'card' || paymentMethod === 'two_cards',
                          message: 'Data é obrigatória',
                        },
                        validate: (e) =>
                          e.replaceAll('/', '').replaceAll('_', '').length ===
                          4,
                      })}
                      autoComplete='cc-exp'
                      id='expiry'
                      type='tel'
                      placeholder='MM/AA'
                      mask='99/99'
                      style={{
                        background: errors?.expiry ? '#ffdada' : '',
                      }}
                      onChange={(e) => {
                        if (
                          e.target.value.replaceAll('/', '').replaceAll('_', '')
                            .length !== 4
                        ) {
                          setError('expiry', { message: 'Data inválida' });
                          return;
                        }
                        handleInputStateRequired('expiry', e.target.value);
                      }}
                      className={'form-control steps rounded'}
                    />
                  </div>
                </>
              </div>
              <div className='col-6'>
                <>
                  <div className='input-group mb-2'>
                    <span className={styles.text19}>
                      <span>CVC/CVV </span>
                    </span>
                  </div>
                  <div
                    className='input-group mb-2'
                    style={{ [`marginBottom`]: !isMobile ? '12px' : '' }}
                  >
                    <Form.Control
                      {...register('cvc', {
                        required: {
                          value: paymentMethod === 'card' || paymentMethod === 'two_cards',
                          message: 'CVC é obrigatório',
                        },
                        minLength: 3,
                      })}
                      maxLength={4}
                      autoComplete='cc-csc'
                      id='cvc'
                      type='text'
                      style={{
                        background: errors?.cvc ? '#ffdada' : '',
                      }}
                      onChange={(e) => {
                        if (e.target.value.length <= 2) {
                          setError('cvc', { message: 'CVC inválido' });
                          return;
                        }
                        handleInputStateRequired('cvc', e.target.value);
                      }}
                      placeholder='CVC/CVV'
                      className={'form-control steps rounded'}
                    />
                  </div>
                </>
              </div>
            </div>

            <span className={styles.text19}>
              <span>Titular do Cartão</span>
            </span>
            <div className='input-group mb-2'>
              <Form.Control
                {...register('cardHolder', {
                  minLength: 3,
                  required: {
                    value: paymentMethod === 'card' || paymentMethod === 'two_cards',
                    message: 'Nome é obrigatório',
                  },
                  pattern: {
                    value: /^[a-zA-Z ]+$/,
                    message: 'Permitido apenas letras',
                  },
                })}
                autoComplete='cc-name'
                id='cardHolder'
                type='text'
                placeholder='Nome do titular'
                className={'form-control steps rounded'}
                style={{
                  background: errors?.cardHolder ? '#ffdada' : '',
                }}
                onChange={(e) =>
                  handleInputStateRequired('cardHolder', e.target.value)
                }
              />
            </div>
            {/*cpf */}
            {showCpf && !useTwoCards && (
              <div className='input-group mb-2'>
                <Step04.CpfAndCnpj
                  styles={styles}
                  paymentType={paymentType}
                  setPaymentType={setPaymentType}
                  setValue={setValue}
                  setError={setError}
                  errors={errors}
                  register={register}
                  showCnpj={offer.show_cnpj}
                />
              </div>
            )}
            {/*fim cpf */}
            {/* Campo de valor para dois cartões */}
            {useTwoCards && (
              <div className='input-group mb-2' style={{ width: '100%' }}>
                <div style={{ width: '100%' }}>
                  <span className={styles.text19} style={{ display: 'block', marginBottom: '8px' }}>
                    <span>Valor do Cartão 1</span>
                  </span>
                  <NumericFormat
                    value={card1AmountValue}
                    onValueChange={(values) => {
                      if (!isUpdatingRef.current) {
                        const numValue = values.floatValue || 0;
                        const maxValue = totalPriceFinal - 2;
                        const card1Formatted = values.formattedValue || values.value;
                        const lastNumValue = parseAmount(lastCard1ValueRef.current);

                        if (Math.abs(numValue - lastNumValue) < 0.01) {
                          return;
                        }

                        isUpdatingRef.current = true;
                        const card2Value = totalPriceFinal - numValue;
                        const card2Formatted = `R$ ${card2Value.toFixed(2).replace('.', ',')}`;

                        setCard1AmountValue(card1Formatted);
                        setCard2AmountValue(card2Formatted);
                        lastCard1ValueRef.current = card1Formatted;

                        const newErrors = {};
                        if (numValue > maxValue) {
                          newErrors[1] = `O valor máximo é R$ ${maxValue.toFixed(2).replace('.', ',')}`;
                        } else if (numValue < 2) {
                          newErrors[1] = 'O valor mínimo é R$ 2,00';
                        } else if (card2Value < 2) {
                          newErrors[1] = 'O segundo cartão deve ter no mínimo R$ 2,00';
                        }
                        setAmountErrors(newErrors);

                        setValue('card1_amount', card1Formatted, { shouldValidate: false });
                        setValue('card2_amount', card2Formatted, { shouldValidate: false });

                        setTimeout(() => {
                          isUpdatingRef.current = false;
                          validateCardsSum();
                        }, 50);
                      }
                    }}
                    thousandSeparator='.'
                    decimalSeparator=','
                    prefix='R$ '
                    decimalScale={2}
                    fixedDecimalScale
                    placeholder='R$ 0,00'
                    className={
                      amountErrors[1] || errors?.card1_amount
                        ? 'form-control steps rounded is-invalid'
                        : 'form-control steps rounded'
                    }
                    style={{
                      background: amountErrors[1] || errors?.card1_amount ? '#ffdada' : '',
                      width: '100%',
                    }}
                  />
                  {amountErrors[1] && (
                    <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '5px' }}>
                      {amountErrors[1]}
                    </div>
                  )}
                  {totalPriceFinal && !amountErrors[1] && (
                    <small className='text-muted' style={{ fontSize: '0.75rem', display: 'block', marginTop: '5px' }}>
                      Valor mínimo: R$ 2,00 | Valor máximo: R$ {(totalPriceFinal - 2).toFixed(2).replace('.', ',')}
                    </small>
                  )}
                </div>
              </div>
            )}
            <>
              <span className='installments-options'>
                Opções de parcelamento
              </span>
              <Form.Control
                {...register('installments', {
                  required: paymentMethod === 'card' || paymentMethod === 'two_cards',
                })}
                as='select'
                value={watch('installments')}
                onChange={(e) => {
                  setCurrentInstallment(e.target.value);
                  setValue('installments', e.target.value);
                }}
                key={`card1-installments-${card1Amount}`}
              >
                {(() => {
                  let listToUse = installmentsList;
                  if (useTwoCards) {
                    const cardAmount = parseAmount(card1Amount || '');
                    if (cardAmount > 0) {
                      listToUse = calculateCardInstallmentsList(
                        cardAmount,
                        offer.payment.installments,
                        offer.payment.student_pays_interest,
                        offer.payment.installments_fee || 0
                      );
                    }
                  }
                  return listToUse.map((item) => {
                    return (
                      <option
                        value={item.n}
                        key={item.n}
                        onClick={(e) => setValue('installments', e.target.value)}
                      >
                        {item.n}x de {currency(item.price)}
                        {item.n > 1
                          ? offer.payment.student_pays_interest
                            ? '*'
                            : ' sem juros'
                          : null}
                      </option>
                    );
                  });
                })()}
              </Form.Control>
            </>
            {/* Campos do segundo cartão */}
            {useTwoCards && (
              <>
                <div style={{ marginTop: '20px', marginBottom: '10px', paddingTop: '20px', borderTop: '2px solid #e9ecef' }}>
                  <h5 style={{ fontSize: '1rem', fontWeight: '600', margin: '0' }}>
                    Cartão 2
                  </h5>
                </div>
                <div className='input-group mb-2'>
                  <div className='input-group mb-2'>
                    <span className={styles.text19}>
                      <span>Número do Cartão</span>
                    </span>
                  </div>
                  <InputMask
                    {...register('2_number', {
                      required: {
                        value: useTwoCards,
                        message: 'Informe um número válido',
                      },
                      validate: (value) => {
                        return value.replace(/\D/g, '').length >= 15;
                      },
                    })}
                    autoComplete='cc-number'
                    id='2_number'
                    type='tel'
                    placeholder='Digite somente os Números'
                    mask='9999 9999 9999 999999'
                    maskChar=''
                    onChange={(e) => {
                      if (e.target.value.replace(/\D/g, '').length < 14) {
                        setError('2_number', { message: 'Informe um número válido' });
                        return;
                      }
                      handleInputStateRequired('2_number', e.target.value);
                    }}
                    style={{
                      background: errors?.['2_number'] ? '#ffdada' : '',
                    }}
                    className={'form-control steps rounded'}
                  />
                </div>
                <div className='row justify-content-evenly'>
                  <div className='col-6'>
                    <div className='input-group mb-2'>
                      <span className={styles.text19}>
                        <span>Validade </span>
                      </span>
                    </div>
                    <div className='input-group mb-2'>
                      <InputMask
                        {...register('2_expiry', {
                          required: {
                            value: useTwoCards,
                            message: 'Data é obrigatória',
                          },
                          validate: (e) =>
                            e.replaceAll('/', '').replaceAll('_', '').length === 4,
                        })}
                        autoComplete='cc-exp'
                        id='2_expiry'
                        type='tel'
                        placeholder='MM/AA'
                        mask='99/99'
                        style={{
                          background: errors?.['2_expiry'] ? '#ffdada' : '',
                        }}
                        onChange={(e) => {
                          if (
                            e.target.value.replaceAll('/', '').replaceAll('_', '')
                              .length !== 4
                          ) {
                            setError('2_expiry', { message: 'Data inválida' });
                            return;
                          }
                          handleInputStateRequired('2_expiry', e.target.value);
                        }}
                        className={'form-control steps rounded'}
                      />
                    </div>
                  </div>
                  <div className='col-6'>
                    <div className='input-group mb-2'>
                      <span className={styles.text19}>
                        <span>CVC/CVV </span>
                      </span>
                    </div>
                    <div
                      className='input-group mb-2'
                      style={{ [`marginBottom`]: !isMobile ? '12px' : '' }}
                    >
                      <Form.Control
                        {...register('2_cvc', {
                          required: {
                            value: useTwoCards,
                            message: 'CVC é obrigatório',
                          },
                          minLength: 3,
                        })}
                        maxLength={4}
                        autoComplete='cc-csc'
                        id='2_cvc'
                        type='text'
                        style={{
                          background: errors?.['2_cvc'] ? '#ffdada' : '',
                        }}
                        onChange={(e) => {
                          if (e.target.value.length <= 2) {
                            setError('2_cvc', { message: 'CVC inválido' });
                            return;
                          }
                          handleInputStateRequired('2_cvc', e.target.value);
                        }}
                        placeholder='CVC/CVV'
                        className={'form-control steps rounded'}
                      />
                    </div>
                  </div>
                </div>
                <span className={styles.text19}>
                  <span>Titular do Cartão</span>
                </span>
                <div className='input-group mb-2'>
                  <Form.Control
                    {...register('2_cardHolder', {
                      minLength: 3,
                      required: {
                        value: useTwoCards,
                        message: 'Nome é obrigatório',
                      },
                      pattern: {
                        value: /^[a-zA-Z ]+$/,
                        message: 'Permitido apenas letras',
                      },
                    })}
                    autoComplete='cc-name'
                    id='2_cardHolder'
                    type='text'
                    placeholder='Nome do titular'
                    className={'form-control steps rounded'}
                    style={{
                      background: errors?.['2_cardHolder'] ? '#ffdada' : '',
                    }}
                    onChange={(e) =>
                      handleInputStateRequired('2_cardHolder', e.target.value)
                    }
                  />
                </div>
                {/* Campo de valor do segundo cartão (desabilitado) */}
                <div className='input-group mb-2' style={{ width: '100%' }}>
                  <div style={{ width: '100%' }}>
                    <span className={styles.text19} style={{ display: 'block', marginBottom: '8px' }}>
                      <span>Valor do Cartão 2</span>
                    </span>
                    <NumericFormat
                      value={card2AmountValue}
                      disabled={true}
                      thousandSeparator='.'
                      decimalSeparator=','
                      prefix='R$ '
                      decimalScale={2}
                      fixedDecimalScale
                      placeholder='R$ 0,00'
                      className='form-control steps rounded'
                      style={{
                        backgroundColor: '#e9ecef',
                        cursor: 'not-allowed',
                        width: '100%',
                      }}
                    />
                  </div>
                </div>
                <>
                  <span className='installments-options'>
                    Opções de parcelamento
                  </span>
                  <Form.Control
                    {...register('2_installments', {
                      required: useTwoCards,
                    })}
                    as='select'
                    value={watch('2_installments')}
                    onChange={(e) => {
                      setValue('2_installments', e.target.value);
                    }}
                    key={`card2-installments-${card2Amount}`}
                  >
                    {(() => {
                      let listToUse = installmentsList;
                      if (useTwoCards) {
                        const cardAmount = parseAmount(card2Amount || '');
                        if (cardAmount > 0) {
                          listToUse = calculateCardInstallmentsList(
                            cardAmount,
                            offer.payment.installments,
                            offer.payment.student_pays_interest,
                            offer.payment.installments_fee || 0
                          );
                        }
                      }
                      return listToUse.map((item) => {
                        return (
                          <option
                            value={item.n}
                            key={`2-${item.n}`}
                            onClick={(e) => setValue('2_installments', e.target.value)}
                          >
                            {item.n}x de {currency(item.price)}
                            {item.n > 1
                              ? offer.payment.student_pays_interest
                                ? '*'
                                : ' sem juros'
                              : null}
                          </option>
                        );
                      });
                    })()}
                  </Form.Control>
                </>
                {/* CPF do titular antes do resumo */}
                {showCpf && (
                  <div className='input-group mb-2' style={{ marginTop: '20px' }}>
                    <Step04.CpfAndCnpj
                      styles={styles}
                      paymentType={paymentType}
                      setPaymentType={setPaymentType}
                      setValue={setValue}
                      setError={setError}
                      errors={errors}
                      register={register}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
        {allowedPix && (
          <>
            <div
              className={styles.checkboxgroupitem}
              onClick={handleDivClickPix}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.checkbox}>
                <div className={styles.input}>
                  <div className={styles.checkbox1}>
                    <input
                      type='radio'
                      id='radio-pix'
                      name='payment-method'
                      className={
                        paymentMethod === 'pix' ? 'radio active' : 'radio'
                      }
                      checked={paymentMethod === 'pix'}
                      onChange={() => setPaymentMethod('pix')}
                    />
                  </div>
                </div>

                <div className={styles.textandsupportingtext}>
                  <div className={styles.text}>
                    <img
                      src='/external/pix.svg'
                      alt='Ícone do Pix'
                      className={styles.icon}
                    />
                    PIX
                  </div>
                  <div className={styles.supportingtext}>
                    {offer && offer.discounts && offer.discounts.pix > 0
                      ? `${offer.discounts.pix}% OFF`
                      : ''}
                  </div>
                </div>
                {/*TODO*/}
                {/* <div className={styles.text1}>{currency(totalPriceFinal)}</div> */}
              </div>
            </div>
            {paymentMethod === 'pix' && showCpf && (
              <>
                <div
                  className={styles.inputfieldbase2}
                  style={{ width: '100%' }}
                >
                  <Step04.CpfAndCnpj
                    styles={styles}
                    paymentType={paymentType}
                    setPaymentType={setPaymentType}
                    setValue={setValue}
                    setError={setError}
                    errors={errors}
                    register={register}
                    showCnpj={offer.show_cnpj}
                  />
                </div>
              </>
            )}
          </>
        )}
        {allowedBillet && (
          <>
            <div
              className={styles.checkboxgroupitem}
              onClick={handleDivClickBillet}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.checkbox}>
                <div className={styles.input}>
                  <div className={styles.checkbox1}>
                    <input
                      type='radio'
                      id='radio-billet'
                      name='payment-method'
                      className={
                        paymentMethod === 'billet' ? 'radio active' : 'radio'
                      }
                      checked={paymentMethod === 'billet'}
                      onChange={() => setPaymentMethod('billet')}
                    />
                  </div>
                </div>

                <div className={styles.textandsupportingtext}>
                  <div className={styles.text}>
                    <img
                      src='/external/billet.png'
                      alt='Ícone do Boleto Bancário'
                      className={styles.icon}
                    />
                    Boleto bancário
                  </div>
                  <div className={styles.supportingtext}>
                    {offer && offer.discounts && offer.discounts.billet > 0
                      ? `${offer.discounts.billet}% OFF`
                      : ''}
                  </div>
                </div>
                {/*TODO*/}
                {/* <div className={styles.text1}>{currency(totalPriceFinal)}</div> */}
              </div>
            </div>
            {paymentMethod === 'billet' && showCpf && (
              <>
                {/*cpf */}
                <div
                  className={styles.inputfieldbase2}
                  style={{ width: '100%' }}
                >
                  <Step04.CpfAndCnpj
                    styles={styles}
                    paymentType={paymentType}
                    setPaymentType={setPaymentType}
                    setValue={setValue}
                    setError={setError}
                    errors={errors}
                    register={register}
                    showCnpj={offer.show_cnpj}
                  />
                </div>
                {/*fim cpf */}
              </>
            )}
          </>
        )}
        {orderBumps.length > 0 && obComponent}
        {BuyButtonComponent}
      </div>

      <div
        className={styles.div01}
        style={{ display: currentStep !== 3 ? '' : 'none' }}
      >
        <div className={styles.frame37254}>
          <div className={styles.frame37253Unstarted}>
            <span className={styles.text08Unstarted}>3</span>
          </div>
          <span className={styles.text09Unstarted}>
            <span>Pagamento</span>
          </span>
        </div>
        <span className={styles.text11}>
          <span>Escolha uma forma de Pagamento.</span>
        </span>
      </div>
    </>
  );
}

// eslint-disable-next-line react/display-name
Step04.CpfAndCnpj = function (props) {
  const {
    styles,
    paymentType,
    setPaymentType,
    setValue,
    errors,
    register,
    showCnpj,
  } = props;

  return (
    <div className={styles.inputwithlabel2} style={{ width: '100%' }}>
      <span className={styles.text19}>
        <span>{paymentType === 'cpf' ? 'CPF do Titular' : 'CNPJ'}</span>
      </span>
      <div
        className={errors.document ? 'is-invalid' : styles.text}
        style={{
          width: '100%',
          height: '34px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          border: '1px solid #ced4da',
          background: errors?.document ? '#ffdada' : '',
        }}
      >
        <Form.Control
          {...register('document', {
            required: true,
            validate: (value) => {
              return paymentType === 'cpf'
                ? cpf.isValid(value)
                : cnpj.isValid(value);
            },
            onChange: (e) => {
              setValue(
                'document',
                paymentType === 'cpf'
                  ? FormatterCpf(e.target.value)
                  : FormatterCnpj(e.target.value),
                { shouldValidate: true }
              );
            },
          })}
          id='document'
          placeholder={
            paymentType === 'cpf' ? 'Digite seu CPF' : ' Digite seu CNPJ'
          }
          style={{
            border: 'none',
            background: errors?.document ? '#ffdada' : '',
          }}
        />
        {showCnpj && (
          <div
            style={{
              height: '100%',
              position: 'absolute',
              right: '10px',
              gap: '4px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0px',
                margin: '0px',
                fontSize: '0.75rem',
              }}
            >
              CNPJ
            </label>
            <input
              className='cnpj-checkbox'
              style={{ cursor: 'pointer', height: '15px', outline: 'none' }}
              type='checkbox'
              id='check-cnpj'
              checked={paymentType !== 'cpf'}
              onChange={() => {
                const type = paymentType === 'cpf' ? 'cnpj' : 'cpf';
                setPaymentType(type);
                setValue('document', '', {
                  shouldValidate: true,
                });
                setValue('isCnpj', type, {
                  shouldValidate: true,
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
