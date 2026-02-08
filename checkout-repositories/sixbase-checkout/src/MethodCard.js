import { cpf } from 'cpf-cnpj-validator';
import { currency } from 'functions';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import Cards from 'react-credit-cards';
import InputMask from 'react-input-mask';
import { NumericFormat } from 'react-number-format';

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
    for (
      let installment = 2;
      installment <= max_installments;
      installment += 1
    ) {
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
    for (
      let installment = 2;
      installment <= max_installments;
      installment += 1
    ) {
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

const MethodCard = ({
  offer,
  register,
  errors,
  installmentsList,
  paymentMethod,
  getValues,
  setCurrentInstallment,
  setValue,
  totalPriceFinal,
  setError,
  clearErrors,
  watch,
  trackEvent,
}) => {
  const useTwoCards = paymentMethod === 'two_cards';

  const [fields, setFields] = useState({
    cvc: '',
    expiry: '',
    cardHolder: '',
    number: '',
    focused: '',
  });

  const [fields2, setFields2] = useState({
    cvc: '',
    expiry: '',
    cardHolder: '',
    number: '',
    focused: '',
  });

  // State para controlar os valores dos inputs diretamente
  const [card1AmountValue, setCard1AmountValue] = useState('');
  const [card2AmountValue, setCard2AmountValue] = useState('');
  const [amountErrors, setAmountErrors] = useState({});

  // Refs para controlar atualizações e evitar loops
  const initializedRef = useRef(false);
  const isUpdatingRef = useRef(false);
  const lastCard1ValueRef = useRef('');
  const prevTotalPriceFinalRef = useRef(0);
  const cardsErrorTrackedRef = useRef(false);

  // Observar valores dos cartões para recalcular parcelamento (apenas para display)
  const card1Amount = watch('card1_amount');
  const card2Amount = watch('card2_amount');

  // Limpar campos do segundo cartão quando desativar 2 cartões
  useEffect(() => {
    if (!useTwoCards && clearErrors) {
      setValue('2_number', '');
      setValue('2_cardHolder', '');
      setValue('2_expiry', '');
      setValue('2_cvc', '');
      setValue('2_installments', '');
      setValue('card2_amount', '');
      setValue('2_document', '');
      clearErrors('2_number');
      clearErrors('2_cardHolder');
      clearErrors('2_expiry');
      clearErrors('2_cvc');
      clearErrors('2_installments');
      clearErrors('card2_amount');
      clearErrors('2_document');
    }
  }, [useTwoCards, setValue, clearErrors]);

  const handleInputChange = (e, cardIndex = 1) => {
    const { name, value } = e.target;
    // Normalize name removing '2_' prefix if present
    const normalizedName = name.replace(/^2_/, '');

    if (cardIndex === 1) {
      setFields((prevFields) => ({ ...prevFields, [normalizedName]: value }));
    } else {
      setFields2((prevFields) => ({ ...prevFields, [normalizedName]: value }));
    }
  };

  const handleInputFocus = (e, cardIndex = 1) => {
    const { name } = e.target;
    // Normalize name removing '2_' prefix if present
    const normalizedName = name.replace(/^2_/, '');

    if (cardIndex === 1) {
      setFields((prevFields) => ({ ...prevFields, focused: normalizedName }));
    } else {
      setFields2((prevFields) => ({ ...prevFields, focused: normalizedName }));
    }
  };

  // Função auxiliar para parsear valores monetários
  const parseAmount = (value) => {
    if (!value || typeof value !== 'string') return 0;
    // Remove prefixo R$ e espaços, depois converte
    const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned || 0);
  };

  // Função para validar soma dos valores dos cartões
  const validateCardsSum = useCallback(() => {
    if (
      useTwoCards &&
      totalPriceFinal &&
      setError &&
      clearErrors &&
      !isUpdatingRef.current
    ) {
      const amount1Value = getValues('card1_amount') || '';
      const amount2Value = getValues('card2_amount') || '';

      const amount1 = parseAmount(amount1Value);
      const amount2 = parseAmount(amount2Value);
      const sum = amount1 + amount2;
      const tolerance = 0.01; // Tolerância para comparação de float
      const minCard2 = 2; // Mínimo de 2 reais no segundo cartão

      // Verificar se o segundo cartão tem pelo menos 2 reais
      if (amount2 < minCard2) {
        setValue('cards_sum_error', true, { shouldValidate: false });
        setError('cards_sum_error', {
          type: 'manual',
          message: 'O segundo cartão deve ter no mínimo R$ 2,00',
        });
        if (!cardsErrorTrackedRef.current) {
          trackEvent?.('checkout_payment_data_error', {
            step: 'payment',
            paymentMethod: 'credit_card',
            email: getValues('email'),
            phone: getValues('whatsapp'),
          });
          cardsErrorTrackedRef.current = true;
        }
      } else if (Math.abs(sum - totalPriceFinal) > tolerance) {
        setValue('cards_sum_error', true, { shouldValidate: false });
        setError('cards_sum_error', {
          type: 'manual',
          message:
            'A soma dos valores dos cartões deve ser igual ao total da compra',
        });
        if (!cardsErrorTrackedRef.current) {
          trackEvent?.('checkout_payment_data_error', {
            step: 'payment',
            paymentMethod: 'credit_card',
            email: getValues('email'),
            phone: getValues('whatsapp'),
          });
          cardsErrorTrackedRef.current = true;
        }
      } else {
        setValue('cards_sum_error', false, { shouldValidate: false });
        clearErrors('cards_sum_error');
        cardsErrorTrackedRef.current = false;
      }
    }
  }, [
    useTwoCards,
    totalPriceFinal,
    setError,
    clearErrors,
    getValues,
    setValue,
    trackEvent,
  ]);

  // Inicializar e atualizar valores quando dois cartões são ativados ou quando totalPriceFinal muda (ex: frete)
  useEffect(() => {
    if (useTwoCards && totalPriceFinal && totalPriceFinal > 0) {
      const prevTotal = prevTotalPriceFinalRef.current;
      const hasChanged = Math.abs(prevTotal - totalPriceFinal) > 0.01;
      const isInitializing = !initializedRef.current;

      // Se é a primeira vez OU se o totalPriceFinal mudou (ex: frete mudou)
      if (isInitializing || hasChanged) {
        isUpdatingRef.current = true;
        prevTotalPriceFinalRef.current = totalPriceFinal;

        let card1Value, card2Value;

        if (isInitializing) {
          // Primeira vez: inicializar 50/50
          card1Value = Math.min(
            totalPriceFinal - 2,
            Math.floor(totalPriceFinal / 2)
          );
          card2Value = totalPriceFinal - card1Value;
        } else {
          // Total mudou: manter proporção se possível, senão 50/50
          const currentCard1Amount =
            getValues('card1_amount') || card1AmountValue || '';
          const currentCard1Value = parseAmount(currentCard1Amount);

          if (currentCard1Value > 0 && prevTotal > 0) {
            // Manter proporção
            const proportion = currentCard1Value / prevTotal;
            card1Value = Math.min(
              totalPriceFinal - 2,
              Math.max(2, totalPriceFinal * proportion)
            );
            card2Value = totalPriceFinal - card1Value;
          } else {
            // Se não tem valor válido, inicializar 50/50
            card1Value = Math.min(
              totalPriceFinal - 2,
              Math.floor(totalPriceFinal / 2)
            );
            card2Value = totalPriceFinal - card1Value;
          }
        }

        const card1Formatted = `R$ ${card1Value.toFixed(2).replace('.', ',')}`;
        const card2Formatted = `R$ ${card2Value.toFixed(2).replace('.', ',')}`;

        // Atualizar states
        setCard1AmountValue(card1Formatted);
        setCard2AmountValue(card2Formatted);
        lastCard1ValueRef.current = card1Formatted;

        // Atualizar também no form para validação
        setValue('card1_amount', card1Formatted, { shouldValidate: false });
        setValue('card2_amount', card2Formatted, { shouldValidate: false });

        if (isInitializing) {
          // Definir parcelamento padrão (1x) para ambos os cartões apenas na primeira vez
          setValue('installments', 1, { shouldValidate: false });
          setValue('2_installments', 1, { shouldValidate: false });
        }

        setTimeout(() => {
          isUpdatingRef.current = false;
          initializedRef.current = true;
          validateCardsSum();
        }, 100);
      }
    } else if (!useTwoCards && prevTotalPriceFinalRef.current !== 0) {
      // Reset quando sair do modo dois cartões
      setCard1AmountValue('');
      setCard2AmountValue('');
      lastCard1ValueRef.current = '';
      initializedRef.current = false;
      prevTotalPriceFinalRef.current = 0;
    }
  }, [
    useTwoCards,
    totalPriceFinal,
    setValue,
    getValues,
    parseAmount,
    validateCardsSum,
  ]);

  const renderCardForm = (cardIndex) => {
    const isCard1 = cardIndex === 1;
    const cardFields = isCard1 ? fields : fields2;
    const prefix = isCard1 ? '' : '2_';
    const cardPrefix = isCard1 ? 'card1_' : 'card2_';

    return (
      <div className={useTwoCards ? 'mb-4' : ''}>
        {useTwoCards && (
          <h5
            className='mb-3'
            style={{ fontSize: '1.1rem', fontWeight: '600' }}
          >
            Cartão {cardIndex}
          </h5>
        )}
        <div className='row'>
          <div className='col-lg-6 col-md-12'>
            <div className='input-group mb-3'>
              <div className='area'>
                <label htmlFor={`${prefix}number`}>
                  <i className='las la-credit-card' />
                </label>
                <InputMask
                  {...register(`${prefix}number`, {
                    required: {
                      value: paymentMethod === 'card',
                      message: 'Informe um número válido',
                    },
                    validate: (value) => {
                      return value.replace(/\D/g, '').length >= 15;
                    },
                  })}
                  autoComplete='cc-number'
                  id={`${prefix}number`}
                  type='tel'
                  placeholder='Número do Cartão'
                  onKeyUp={(e) => handleInputChange(e, cardIndex)}
                  onFocus={(e) => handleInputFocus(e, cardIndex)}
                  mask='9999 9999 9999 999999'
                  maskChar=''
                  className={
                    errors[`${prefix}number`]
                      ? 'form-control is-invalid'
                      : 'form-control'
                  }
                />
                <div className='input-error'>
                  {errors?.[`${prefix}number`]?.message}
                </div>
              </div>
            </div>

            <div className='date form-group mb-3'>
              <div className='input-group'>
                <div className='area'>
                  <label htmlFor={`${prefix}cc-exp`}>
                    <i className='las la-calendar-minus'></i>
                  </label>
                  <InputMask
                    {...register(`${prefix}expiry`, {
                      required: {
                        value: paymentMethod === 'card',
                        message: 'Data é obrigatória',
                      },
                      validate: (e) =>
                        e.replaceAll('/', '').replaceAll('_', '').length === 4,
                    })}
                    autoComplete='cc-exp'
                    id={`${prefix}expiry`}
                    type='tel'
                    placeholder='MM/AA'
                    onKeyUp={(e) => handleInputChange(e, cardIndex)}
                    onFocus={(e) => handleInputFocus(e, cardIndex)}
                    mask='99/99'
                    className={
                      errors[`${prefix}expiry`]
                        ? 'form-control is-invalid'
                        : 'form-control'
                    }
                  />
                  <div className='input-error'>
                    {errors?.[`${prefix}expiry`]?.message}
                  </div>
                </div>
              </div>
              <div className='input-group'>
                <div className='area'>
                  <label htmlFor={`${prefix}cvc`}>
                    <i className='las la-lock'></i>
                  </label>
                  <Form.Control
                    {...register(`${prefix}cvc`, {
                      required: {
                        value: paymentMethod === 'card',
                        message: 'CVC é obrigatório',
                      },
                      minLength: 3,
                    })}
                    onKeyUp={(e) => handleInputChange(e, cardIndex)}
                    onFocus={(e) => handleInputFocus(e, cardIndex)}
                    maxLength={4}
                    autoComplete='cc-csc'
                    id={`${prefix}cvc`}
                    type='text'
                    placeholder='CVC/CVV'
                    className={errors[`${prefix}cvc`] ? 'is-invalid' : null}
                  />
                  <div className='input-error'>
                    {errors?.[`${prefix}cvc`]?.message}
                  </div>
                </div>
              </div>
            </div>
            <div className='input-group mb-3'>
              <div className='area'>
                <label htmlFor={`${prefix}name`}>
                  <i className='las la-user' />
                </label>
                <Form.Control
                  {...register(`${prefix}cardHolder`, {
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
                  onKeyUp={(e) => handleInputChange(e, cardIndex)}
                  onFocus={(e) => handleInputFocus(e, cardIndex)}
                  autoComplete='cc-name'
                  id={`${prefix}cardHolder`}
                  className={
                    errors[`${prefix}cardHolder`] ? 'is-invalid' : null
                  }
                  type='text'
                  placeholder='Nome do titular'
                />
                <div className='input-error'>
                  {errors?.[`${prefix}cardHolder`]?.message}
                </div>
              </div>
            </div>
            {offer.cpf_bottom && (
              <div className='input-group mb-3'>
                <div className='area'>
                  <label htmlFor={`${prefix}cpf`}>
                    <i className='las la-address-card' />
                  </label>
                  <InputMask
                    {...register(`${prefix}document`, {
                      required: true,
                      validate: (value) => {
                        if (!value) return false;
                        let crop = value.substring(0, 14);
                        return cpf.isValid(crop);
                      },
                    })}
                    autoComplete='off'
                    id={`${prefix}cpf`}
                    type='tel'
                    placeholder='CPF do titular'
                    mask='999.999.999-99'
                    className={
                      errors[`${prefix}document`]
                        ? 'form-control is-invalid'
                        : 'form-control'
                    }
                  />
                  {errors[`${prefix}document`] && (
                    <div className='input-error'>CPF inválido</div>
                  )}
                </div>
              </div>
            )}
            {useTwoCards && (
              <div className='input-group mb-3'>
                <div className='area'>
                  <label htmlFor={`${cardPrefix}amount`}>
                    <i className='las la-money-bill-wave' />
                  </label>
                  <NumericFormat
                    value={
                      cardIndex === 1 ? card1AmountValue : card2AmountValue
                    }
                    disabled={cardIndex === 2}
                    onValueChange={(values) => {
                      if (cardIndex === 1 && !isUpdatingRef.current) {
                        // Usar floatValue diretamente do NumericFormat para preservar decimais
                        const numValue = values.floatValue || 0;
                        const maxValue = totalPriceFinal - 2;

                        // Usar o valor formatado diretamente do NumericFormat
                        const card1Formatted =
                          values.formattedValue || values.value;

                        // Evitar atualização se o valor numérico não mudou significativamente
                        const lastNumValue = parseAmount(
                          lastCard1ValueRef.current
                        );
                        if (Math.abs(numValue - lastNumValue) < 0.01) {
                          return;
                        }

                        isUpdatingRef.current = true;

                        // Calcular segundo cartão automaticamente
                        const card2Value = totalPriceFinal - numValue;
                        const card2Formatted = `R$ ${card2Value
                          .toFixed(2)
                          .replace('.', ',')}`;

                        // Atualizar states - usar o valor formatado do NumericFormat
                        setCard1AmountValue(card1Formatted);
                        setCard2AmountValue(card2Formatted);
                        lastCard1ValueRef.current = card1Formatted;

                        // Validar limites e mostrar erros
                        const newErrors = {};
                        if (numValue > maxValue) {
                          newErrors[1] = `O valor máximo é R$ ${maxValue
                            .toFixed(2)
                            .replace('.', ',')}`;
                        } else if (numValue < 2) {
                          newErrors[1] = 'O valor mínimo é R$ 2,00';
                        } else if (card2Value < 2) {
                          newErrors[1] =
                            'O segundo cartão deve ter no mínimo R$ 2,00';
                        }
                        setAmountErrors(newErrors);

                        // Atualizar também no form para validação
                        setValue('card1_amount', card1Formatted, {
                          shouldValidate: false,
                        });
                        setValue('card2_amount', card2Formatted, {
                          shouldValidate: false,
                        });

                        // Liberar flag e validar após um pequeno delay
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
                      errors[`${cardPrefix}amount`]
                        ? 'form-control is-invalid'
                        : cardIndex === 2
                          ? 'form-control'
                          : 'form-control'
                    }
                    style={
                      cardIndex === 2
                        ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' }
                        : {}
                    }
                  />
                  <div className='input-error'>
                    {amountErrors[cardIndex] ||
                      errors?.[`${cardPrefix}amount`]?.message}
                  </div>
                  {cardIndex === 1 && totalPriceFinal && (
                    <small
                      className='text-muted'
                      style={{ fontSize: '0.75rem' }}
                    >
                      Valor máximo: R${' '}
                      {(totalPriceFinal - 2).toFixed(2).replace('.', ',')}
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
                {...register(`${prefix}installments`, {
                  required: paymentMethod === 'card',
                })}
                as='select'
                onChange={(e) => {
                  if (isCard1) {
                    setCurrentInstallment(e.target.value);
                  }
                  setValue(`${prefix}installments`, e.target.value);
                }}
                value={watch(`${prefix}installments`) || '1'}
                key={`${cardPrefix}-installments-${isCard1 ? card1Amount : card2Amount
                  }`}
              >
                {(() => {
                  // Se for dois cartões, calcular parcelamento baseado no valor do cartão específico
                  let listToUse = installmentsList;
                  if (useTwoCards) {
                    // Usar watch para reagir a mudanças
                    const cardAmountValue = isCard1 ? card1Amount : card2Amount;
                    const cardAmount = parseAmount(cardAmountValue || '');
                    if (cardAmount > 0) {
                      listToUse = calculateCardInstallmentsList(
                        cardAmount,
                        offer.payment.installments,
                        offer.payment.student_pays_interest,
                        offer.payment.installments_fee || 0
                      );
                    } else {
                      // Se ainda não tem valor, usar lista padrão
                      listToUse = installmentsList;
                    }
                  }

                  // Se não tem opções, retornar array vazio
                  if (!listToUse || listToUse.length === 0) {
                    return (
                      <option value='1'>
                        1x de{' '}
                        {currency(
                          isCard1
                            ? parseAmount(card1Amount || '')
                            : parseAmount(card2Amount || '')
                        )}
                      </option>
                    );
                  }

                  return listToUse.map((item) => {
                    return (
                      <option
                        value={item.n}
                        key={`${cardPrefix}-${item.n}`}
                        onClick={(e) =>
                          setValue(`${prefix}installments`, e.target.value)
                        }
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
          </div>
          <div className='card-preview col-lg-6 col-md-12 border-left'>
            <Cards
              focused={cardFields.focused}
              cvc={cardFields.cvc}
              expiry={cardFields.expiry}
              name={cardFields.cardHolder}
              number={cardFields.number}
              locale={{ valid: 'validade' }}
              placeholders={{ name: 'Titular do Cartão' }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderCardForm(1)}

      {useTwoCards && <>{renderCardForm(2)}</>}
    </div>
  );
};

export default MethodCard;
