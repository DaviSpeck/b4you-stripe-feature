import api from 'api';
import { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import InputMask from 'react-input-mask';
import { useParams } from 'react-router-dom';

export function CardForm(props) {
  const {
    creditCardData,
    offerSelectUuid,
    planSelectUuid,
    upsellOfferUuid,
    onErrorPayment,
    onProcess,
    onPaymentSucces,
  } = props;

  const { uuidOffer, uuidSaleItem } = useParams();

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      installments: 12,
    },
  });

  const { errors } = form.formState;

  const handlePayment = async (data) => {
    try {
      onProcess(true);
      await api.post('/sales/process-upsell', data);
      onPaymentSucces(true);
      onErrorPayment(false);
    } catch (error) {
      onErrorPayment(true);
      return error;
    } finally {
      onProcess(false);
    }
  };

  const onSubmit = (data) => {
    handlePayment({
      offer_id: planSelectUuid
        ? upsellOfferUuid
        : offerSelectUuid ?? uuidOffer,
      sale_item_id: uuidSaleItem,
      payment_method: 'card',
      installments: Number(data.installments),
      plan_id: planSelectUuid ?? null,
      card: {
        card_holder: data.cardHolder,
        card_number: data.number.replace(/\D/g, ''),
        cvv: data.cvc,
        expiration_date: data.expiry,
      },
    });
  };

  useEffect(() => {
    if (!creditCardData) return;
    form.setValue('installments', creditCardData.default_installment);
  }, [creditCardData]);

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      style={{
        padding: '0px',
      }}
    >
      <div className='input-group mb-2 mt-3'>
        <div className='input-group mb-2'>
          <span className='label-input-new-card'>
            <span>Número do Cartão</span>
          </span>
        </div>
        <InputMask
          {...form.register('number', {
            required: {
              value: true,
              message: 'Informe um número válido',
            },
            validate: (value) => {
              if (value.replace(/\D/g, '').length < 15) {
                form.setError('card', { message: 'Informe um número válido' });
                return false;
              }
              form.clearErrors('card');
              return true;
            },
          })}
          className={'form-control steps rounded'}
          autoComplete='cc-number'
          id='number'
          type='tel'
          placeholder='Digite somente os Números'
          mask='9999 9999 9999 999999'
          maskChar=''
          style={{
            fontSize: '0.85rem',
            background: errors?.number ? '#ffdada' : '',
          }}
        />
      </div>
      <div className='row justify-content-evenly'>
        <div className='col-6'>
          <>
            <div className='input-group mb-2'>
              <span className='label-input-new-card'>
                <span>Validade </span>
              </span>
            </div>
            <div className='input-group mb-2'>
              <InputMask
                {...form.register('expiry', {
                  required: {
                    value: true,
                    message: 'Data é obrigatória',
                  },
                  validate: (e) =>
                    e.replaceAll('/', '').replaceAll('_', '').length === 4,
                })}
                autoComplete='cc-exp'
                id='expiry'
                type='tel'
                placeholder='MM/AA'
                mask='99/99'
                style={{
                  fontSize: '0.85rem',
                  background: errors?.expiry ? '#ffdada' : '',
                }}
                className={'form-control steps rounded'}
              />
            </div>
          </>
        </div>
        <div className='col-6'>
          <>
            <div className='input-group mb-2'>
              <span className='label-input-new-card'>
                <span>CVC/CVV </span>
              </span>
            </div>
            <div className='input-group mb-2'>
              <Form.Control
                {...form.register('cvc', {
                  required: {
                    value: true,
                    message: 'CVC é obrigatório',
                  },
                  minLength: 3,
                })}
                className={'form-control steps rounded'}
                placeholder='CVC/CVV'
                maxLength={4}
                autoComplete='cc-csc'
                id='cvc'
                type='text'
                style={{
                  fontSize: '0.85rem',
                  background: errors?.cvc ? '#ffdada' : '',
                }}
              />
            </div>
          </>
        </div>
      </div>

      <span className='label-input-new-card'>
        <span>Titular do Cartão</span>
      </span>
      <div className='input-group mb-2'>
        <Form.Control
          {...form.register('cardHolder', {
            minLength: 3,
            required: {
              value: true,
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
            fontSize: '0.85rem',
            background: errors?.cardHolder ? '#ffdada' : '',
          }}
        />
      </div>
      <>
        <span className='installments-options'>Opções de parcelamento</span>
        <Form.Control
          {...form.register('installments', {
            required: true,
          })}
          as='select'
          style={{
            fontSize: '0.85rem',
          }}
        >
          {creditCardData?.installments?.map((item) => {
            return (
              <option
                value={item.parcel}
                key={item.parcel}
                onClick={(e) => setValue('installments', e.target.value)}
              >
                {item.parcel}x de{' '}
                {Number(item.value.toFixed(2)).toLocaleString('pt-br', {
                  currency: 'BRL',
                  style: 'currency',
                })}
                {creditCardData.studentPaysInterest && item.parcel > 1 && '*'}
              </option>
            );
          })}
        </Form.Control>
      </>
      <div className='wrapper-input-buy-new-card'>
        <button className='upsell-native-inputs-btn' type='submit'>
          Comprar agora
        </button>
      </div>
    </form>
  );
}
