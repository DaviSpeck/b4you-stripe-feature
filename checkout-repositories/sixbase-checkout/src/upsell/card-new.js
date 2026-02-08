import { useEffect } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { currency } from 'functions';
import Cards from 'react-credit-cards';
import InputMask from 'react-input-mask';
import { useState } from 'react';
import PropTypes from 'prop-types';
import useQuery from 'query/queryHook';
import api from '../api';

const CardNew = ({
  active,
  card,
  uuidOffer,
  uuidSaleItem,
  redirectParent,
  price,
  isSubscription,
}) => {
  const { register, formState, handleSubmit, reset } = useForm({
    mode: 'onChange',
  });
  const [fields, setFields] = useState({
    cvc: '',
    expiry: '',
    cardHolder: '',
    number: '',
    focused: '',
  });
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] = useState(
    'Compra não autorizada, tente novamente!'
  );
  const query = useQuery();

  const { isValid, errors } = formState;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFields((prevFields) => ({ ...prevFields, [name]: value }));
  };

  const handleInputFocus = (e) => {
    const { name } = e.target;

    setFields((prevFields) => ({ ...prevFields, focused: name }));
  };

  const submitUpsellNewCard = async (data) => {
    setLoading(true);

    const body = {
      offer_id: uuidOffer,
      sale_item_id: uuidSaleItem,
      payment_method: 'card',
      installments: data.installments ? data.installments : 1,
      card: {
        card_number: data.number.replaceAll(' ', ''),
        card_holder: data.cardHolder,
        expiration_date: data.expiry,
        cvv: data.cvc,
      },
    };
    const plan = query.get('plan');
    if (plan) body['plan_id'] = plan;
    api
      .post(`/sales/process-upsell`, body)
      .then((response) => {
        /**
         * {
         *  sale_item_id,
         *  status, 'created' (pix), 'paid', 'rejected'
         *  base64_qrcode, 'qrcode image'
         *  qrcode 'qrcode string'
         * }
         */
        setLoading(false);
        const { status } = response.data;

        if (status === 'paid') {
          redirectParent('accept');
        }

        if (status === 'rejected') setShowAlert(true);
      })
      .catch((error) => {
        setLoading(false);
        setShowAlert(true);
        if (error.response.data) {
          setAlertText(error.response.data.message);
        }
        // redirectParent();
      });

    // capture event (disable on 24/03/2025)
    // const evenDate = {
    //   eventType: 'button_click',
    //   eventName: 'upsell',
    //   idOffer: uuidOffer,
    // };
    // createEvent(evenDate);
  };

  useEffect(() => {
    if (card && card.installmentsList) {
      const [firstItem] = card.installmentsList;
      reset({ installments: firstItem.n });
    }
  }, [card]);

  return (
    <section className={active ? 'tokenized active' : 'tokenized'}>
      <div className='header'>
        <span className='check'>
          <i className='las la-check' />
        </span>

        <span className='subtitle'>Novo cartão de crédito</span>
      </div>
      <div className='collapsed'>
        Cadastre um novo cartão de crédito para a compra
      </div>
      <form onSubmit={handleSubmit(submitUpsellNewCard)}>
        <div className='body'>
          <Alert
            variant='danger'
            show={showAlert}
            className='d-flex align-items-center'
          >
            <i className='las la-exclamation-triangle mr-1'></i>
            {alertText}
          </Alert>
          <div className='row'>
            <div className='col-lg-6 col-md-12'>
              <div className='input-group mb-3'>
                <div className='area'>
                  <label htmlFor='card'>
                    <i className='las la-credit-card' />
                  </label>

                  <InputMask
                    {...register('number', {
                      required: true,
                      minLength: 19,
                      validate: (value) =>
                        value.replace(/\D/g, '').length >= 16,
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
                      errors.number ? 'form-control is-invalid' : 'form-control'
                    }
                  />
                </div>
              </div>

              <div className='date form-group mb-3'>
                <div className='input-group'>
                  <div className='area'>
                    <label htmlFor='cc-exp'>
                      <i className='las la-calendar-minus'></i>
                    </label>

                    <InputMask
                      {...register('expiry', {
                        required: true,
                        validate: (e) =>
                          e.replaceAll('/', '').replaceAll('_', '').length ===
                          4,
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
                  </div>
                </div>
                <div className='input-group'>
                  <div className='area'>
                    <label htmlFor='cvc'>
                      <i className='las la-lock'></i>
                    </label>
                    <Form.Control
                      {...register('cvc', {
                        required: true,
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
                      required: true,
                      minLength: 3,
                    })}
                    onKeyUp={handleInputChange}
                    onFocus={handleInputFocus}
                    autoComplete='cc-name'
                    id='cardHolder'
                    className={errors.cardHolder ? 'is-invalid' : null}
                    type='text'
                    placeholder='Nome do titular'
                  />
                </div>
              </div>
              <div className='form-group'>
                {isSubscription === true ? (
                  <div className='form-control'>1x de {currency(price)}</div>
                ) : (
                  <select
                    className='form-control'
                    {...register('installments')}
                  >
                    {card &&
                      card.installmentsList &&
                      card.installmentsList.map((item) => (
                        <option
                          key={`card-tokenized-installment-${item.n}`}
                          value={item.n}
                        >
                          {item.n}x de {currency(item.price)}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            </div>
            <div className='card-preview col-lg-6 col-md-12 border-left mb-3'>
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

          <button
            className='btn w-100 py-3 mt-0'
            type='submit'
            disabled={!isValid || loading}
          >
            {loading ? 'Processando ...' : 'Finalizar compra'}
          </button>
        </div>
      </form>
    </section>
  );
};

CardNew.propTypes = {
  active: PropTypes.bool,
  card: PropTypes.object,
  uuidSaleItem: PropTypes.string,
  uuidOffer: PropTypes.string,
  redirectParent: PropTypes.func,
  price: PropTypes.number,
  isSubscription: PropTypes.bool,
};

export default CardNew;
