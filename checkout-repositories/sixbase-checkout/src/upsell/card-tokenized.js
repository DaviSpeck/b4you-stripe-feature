import { useState } from 'react';
import { currency } from 'functions';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import useQuery from 'query/queryHook';
import api from '../api';

const CardTokenized = ({
  active,
  card,
  uuidSaleItem,
  uuidOffer,
  redirectParent,
  price,
  isSubscription,
}) => {
  const { register, handleSubmit, reset } = useForm({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] = useState(
    'Compra não autorizada, tente novamente!'
  );
  const [loading, setLoading] = useState(false);
  const query = useQuery();

  const submitUpsellCardToken = (data) => {
    setLoading(true);
    const body = {
      offer_id: uuidOffer,
      sale_item_id: uuidSaleItem,
      payment_method: 'card',
      installments: data.installments ? data.installments : 1,
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
        const { status } = response.data;

        setLoading(false);
        if (status === 'paid') {
          redirectParent('accept');
          // alert('pago com cartão novo');
        }
        if (status === 'rejected') setShowAlert(true);
      })
      .catch((error) => {
        setShowAlert(true);
        if (error.response.data) {
          setAlertText(error.response.data.message);
        }
        setLoading(false);
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
    if (card.installmentsList) {
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

        <span className='subtitle'>Pagar com cartão de crédito</span>
      </div>
      <div className='collapsed'>
        Pague agora mesmo com seu cartão já utilizado
      </div>
      <form onSubmit={handleSubmit(submitUpsellCardToken)}>
        <div className='body'>
          <Alert
            variant='danger'
            show={showAlert}
            className='d-flex align-items-center'
          >
            <i className='las la-exclamation-triangle mr-1'></i>
            {alertText}
          </Alert>
          <div className='form-group'>
            <label htmlFor=''>Número do cartão</label>

            <div className='current-card'>
              <div className='icon'>
                <i className='las la-credit-card' />
              </div>
              <div className='dots'>
                <span className='dot'></span>
                <span className='dot'></span>
                <span className='dot'></span>
                <span className='dot'></span>
              </div>
              <div className='dots'>
                <span className='dot'></span>
                <span className='dot'></span>
                <span className='dot'></span>
                <span className='dot'></span>
              </div>
              <div className='dots'>
                <span className='dot'></span>
                <span className='dot'></span>
                <span className='dot'></span>
                <span className='dot'></span>
              </div>
              <span className='last-four'>{card?.lastFourDigits}</span>
            </div>
          </div>
          <div className='form-group'>
            {isSubscription === true ? (
              <div className='form-control'>1x de {currency(price)}</div>
            ) : (
              <select className='form-control' {...register('installments')}>
                {/* <option value=''>em 1x de R$ 650,00</option> */}
                {card.installmentsList &&
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
          <button
            className='btn w-100 py-3 mt-0'
            type='submit'
            disabled={loading}
          >
            {loading ? 'Processando ...' : 'Finalizar compra'}
          </button>
        </div>
      </form>
    </section>
  );
};

CardTokenized.propTypes = {
  active: PropTypes.bool,
  card: PropTypes.object,
  uuidSaleItem: PropTypes.string,
  uuidOffer: PropTypes.string,
  redirectParent: PropTypes.func,
  price: PropTypes.number,
  isSubscription: PropTypes.bool,
};

export default CardTokenized;
