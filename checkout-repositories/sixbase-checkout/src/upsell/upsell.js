import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MethodCard from './card';
import Navigation from './navigation';
import MethodPix from './pix';
import api from '../api';
import './style.scss';
import useQuery from 'query/queryHook';
import { hasQueryParams } from '../functions';

const defaults = {
  paymentMethod: 'card',
  allowedPaymentMethods: ['card'],
  card: null,
  selectedInstallment: null,
};

const Loading = () => {
  return (
    <div className='d-flex flex-column justify-content-center align-items-center'>
      <div>Aguarde um momento...</div>
      <div className='mt-3 loader'></div>
    </div>
  );
};

const Upsell = () => {
  const [paymentMethod, setPaymentMethod] = useState(defaults.paymentMethod);
  const [allowedPaymentMethods, setAllowedPaymentMethods] = useState(
    defaults.allowedPaymentMethods
  );
  const [card, setCard] = useState(defaults.card);
  const [isSubscription, setIsSubscription] = useState(false);
  const [price, setPrice] = useState(0);
  const { uuidSaleItem, uuidOffer } = useParams();
  const query = useQuery();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const plan = query.get('plan');
  const lastInstallments = query.get('last_installments');

  const oneClickBuy = () => {
    // capture event (disable on 24/03/2025)
    // const evenData = {
    //   eventType: 'pageload',
    //   eventName: 'upsell-oneclick',
    //   idOffer: uuidOffer,
    // };
    // createEvent(evenData);

    let oneClick = query.get('oneClick');
    if (oneClick === 'false' || lastInstallments === 'null') {
      setLoading(false);
      setError(true);
      return;
    }
    const body = {
      offer_id: uuidOffer,
      sale_item_id: uuidSaleItem,
      payment_method: 'card',
    };
    if (plan) {
      body.plan_id = plan;
    }
    if (lastInstallments) {
      body.installments = lastInstallments;
    }

    const urlParams = new URLSearchParams(query);
    const stringParams = urlParams.toString();

    api
      .post(`/sales/process-upsell?${stringParams}`, body)
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
        if (status === 'paid') {
          redirectParent('accept');
          // alert('pago com cartão novo');
        }
        if (status === 'rejected') {
          redirectParent('delivery');
        }
      })
      .catch(() => {
        redirectParent('delivery');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchUpsellInfo = async () => {
    const plan = query.get('plan');
    const params = new URLSearchParams();
    params.append('offer_id', uuidOffer);
    params.append('sale_item_id', uuidSaleItem);
    if (plan) params.append('plan_id', plan);
    api.get(`/offers/info?${params.toString()}`).then((response) => {
      const { allowed_payment_methods, card, last_payment_method, price } =
        response.data;
      setAllowedPaymentMethods(allowed_payment_methods);
      if (allowedPaymentMethods.includes(last_payment_method)) {
        setPaymentMethod(last_payment_method);
      } else {
        setPaymentMethod(allowed_payment_methods[0]);
      }
      setPrice(price);
      if (card) {
        setCard({
          brand: card.brand,
          lastFourDigits: card.last_four_digits,
          installmentsList: card.installments_list.reverse(),
        });
      }
      if (plan) {
        setIsSubscription(true);
      }
    });
  };

  const redirectParent = (option = 'delivery') => {
    // 'accept' 'reject' 'delivery'
    let redirectURL = '';
    let finalDestination = option;
    const queryParamsUpsellURL = query.get('redirect');
    const redirectStr = Buffer.from(queryParamsUpsellURL, 'base64').toString(
      'ascii'
    );
    const redirectObj = JSON.parse(decodeURIComponent(redirectStr));
    if (option === 'delivery') redirectURL = redirectObj.deliveryURL;
    if (option === 'accept') {
      redirectURL = redirectObj.acceptUpsellURL
        ? redirectObj.acceptUpsellURL
        : redirectObj.deliveryURL;
      finalDestination = redirectObj.acceptUpsellURL ? 'accept' : 'delivery';
    }
    if (option === 'refuse') {
      redirectURL = redirectObj.refuseUpsellURL
        ? redirectObj.refuseUpsellURL
        : redirectObj.deliveryURL;
      finalDestination = redirectObj.refuseUpsellURL ? 'refuse' : 'delivery';
    }

    if (finalDestination === 'delivery') {
      const redirectUpsellURL = `${redirectURL}/${uuidSaleItem}`;
      // window.top.location.href = redirectUpsellURL;
      parent.location = redirectUpsellURL;
    } else {
      const hasQP = hasQueryParams(redirectURL);
      const queryParams = new URLSearchParams();
      queryParams.append('sale_item_id', uuidSaleItem);
      const redirectUpsellURL = `${redirectURL}${
        hasQP ? '&' : '?'
      }${queryParams.toString()}`;
      // window.top.location.href = redirectUpsellURL;
      parent.location = redirectUpsellURL;
    }
  };

  useEffect(() => {
    fetchUpsellInfo();
    oneClickBuy();
    // capture event (disable on 24/03/2025)
    // const evenData = {
    //   eventType: 'pageload',
    //   eventName: 'upsell',
    //   idOffer: uuidOffer,
    // };
    // createEvent(evenData);
    return () => {
      setAllowedPaymentMethods(defaults.allowedPaymentMethods);
    };
  }, []);

  return (
    <section id='upsell'>
      {loading && <Loading />}
      {!loading && error && (
        <>
          <Navigation
            allowedPaymentMethods={allowedPaymentMethods}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
          {paymentMethod === 'card' && (
            <MethodCard
              card={card}
              uuidSaleItem={uuidSaleItem}
              uuidOffer={uuidOffer}
              redirectParent={redirectParent}
              price={price}
              isSubscription={isSubscription}
            />
          )}
          {paymentMethod === 'pix' && (
            <MethodPix
              uuidSaleItem={uuidSaleItem}
              uuidOffer={uuidOffer}
              redirectParent={redirectParent}
            />
          )}
          <div
            style={{
              marginTop: 16,
            }}
          >
            <span
              onClick={() => redirectParent('refuse')}
              style={{
                textDecoration: 'underline',
                opacity: 0.7,
                color: '#344054',
                cursor: 'pointer',
              }}
            >
              Não quero comprar
            </span>
          </div>
        </>
      )}
    </section>
  );
};

export default Upsell;
