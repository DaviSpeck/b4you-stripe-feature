import CardDeclined from 'card/CardDeclined';
import CardSuccess from 'card/CardSuccess';
import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useEffect } from 'react';
import api from 'api';
import Requesting from 'Requesting';
import { useNavigate } from 'react-router-dom';
import {
  pixelTikTok,
  googleAnalyticsSend,
  googleAdsSend,
  eventKwaiPixel,
  pixelNativeSingle,
  cleanDocument,
  injectGoogleTagManager,
  pushGTMEvent,
} from './functions';
import { sendApiEvent } from './utils/pixels/facebookAPiConversion';
import Cookies from 'js-cookie';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { v4 as uuidv4 } from 'uuid';
const fpPromise = FingerprintJS.load();
import { useDualKondutoContext } from './hooks/DualKondutoProvider';
import { PageTracker } from './hooks/PageTracker';
import { useCheckoutTracking } from './tracking/useCheckoutTracking';

const ModalCard = ({
  offer,
  uuidOffer,
  paymentStatus,
  setPaymentStatus,
  getValues,
  selectedPlan,
  selectedBumps,
  fullName,
  pixels,
  googlePixels,
  googleAds,
  coupon,
  kwaiPixels,
  sessionID,
  turnstileToken,
  setDisplayChallenge,
  b4f,
  delivery,
  setLoading,
  integration_shipping_price,
  integration_shipping_company,
  query,
  pinterestPixels,
  paymentMethod,
  checkoutType,
}) => {
  const [error, setError] = useState(null);
  const [requesting, setRequesting] = useState(true);
  const [sentFbPixel, setSentFbPixel] = useState(false);
  const [sentGoogleAnalystics, setSentGoogleAnalystics] = useState(false);
  const { setCustomerIdPrimary, setCustomerIdSecondary } =
    useDualKondutoContext();
  const { trackEvent } = useCheckoutTracking({
    offerId: uuidOffer,
    checkoutType,
  });

  const navigate = useNavigate();

  async function getFingerprint() {
    try {
      const fp = await fpPromise;
      const result = await fp.get();
      const visitorId = result.visitorId;
      let localUuid = localStorage.getItem('local_visitor_uuid');
      if (!localUuid) {
        localUuid = uuidv4();
        localStorage.setItem('local_visitor_uuid', localUuid);
      }
      const id = `${visitorId}-${localUuid}`;
      const isDigital =
        offer?.product?.is_digital === true ||
        offer?.type === 'digital' ||
        offer?.product?.type === 'digital' ||
        delivery === null;
      if (isDigital) {
        await setCustomerIdSecondary(id);
      } else {
        await setCustomerIdPrimary(id);
      }
      return id;
    } catch (error) {
      let fallbackUuid = localStorage.getItem('local_visitor_uuid');
      if (!fallbackUuid) {
        fallbackUuid = uuidv4();
        localStorage.setItem('local_visitor_uuid', fallbackUuid);
      }
      return `fallback-${fallbackUuid}`;
    }
  }

  useEffect(() => {
    const fetchApi = async () => {
      let orderBumps = [];
      const visitorId = await getFingerprint();
      selectedBumps.forEach((item) => {
        if (item.quantity) {
          orderBumps.push(item.uuid);
        }
      });

      // Verificar se o método de pagamento é dois cartões
      const useTwoCards = paymentMethod === 'two_cards';

      // Converter valores de string formatada para número
      const parseAmount = (value) => {
        if (!value) return 0;
        return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.') || 0);
      };

      let body = {
        full_name: getValues('full_name'),
        email: getValues('email'),
        document_number: cleanDocument(getValues('document')),
        whatsapp: getValues('whatsapp'),
        address: {
          zipcode: delivery === null ? getValues('zipcode') : delivery?.cep,
          street: getValues('street'),
          number: getValues('number_address'),
          complement: getValues('complement'),
          neighborhood: getValues('neighborhood'),
          city: delivery?.localidade,
          state: delivery?.uf,
        },
        offer_id: uuidOffer,
        order_bumps: orderBumps,
        coupon: coupon?.coupon,
        sessionID,
        visitorId,
        b4f,
        payment_method: 'card',
        integration_shipping_price,
        integration_shipping_company,
        params: {},
      };

      if (useTwoCards) {
        // Formato para 2 cartões
        const card1Amount = getValues('card1_amount');
        const card2Amount = getValues('card2_amount');

        body.cards = [
          {
            card_number: getValues('number').replaceAll(' ', ''),
            card_holder: getValues('cardHolder'),
            expiration_date: getValues('expiry'),
            cvv: getValues('cvc'),
            installments: getValues('installments'),
            amount: parseAmount(card1Amount),
          },
          {
            card_number: getValues('2_number').replaceAll(' ', ''),
            card_holder: getValues('2_cardHolder'),
            expiration_date: getValues('2_expiry'),
            cvv: getValues('2_cvc'),
            installments: getValues('2_installments'),
            amount: parseAmount(card2Amount),
          },
        ];
      } else {
        // Formato para 1 cartão - sempre como array
        body.cards = [
          {
            card_number: getValues('number').replaceAll(' ', ''),
            card_holder: getValues('cardHolder'),
            expiration_date: getValues('expiry'),
            cvv: getValues('cvc'),
            installments: getValues('installments'),
          },
        ];
      }

      if (query.get('src')) body.params.src = query.get('src');
      if (query.get('sck')) body.params.sck = query.get('sck');
      if (query.get('utm_source'))
        body.params.utm_source = query.get('utm_source');
      if (query.get('utm_medium'))
        body.params.utm_medium = query.get('utm_medium');
      if (query.get('utm_campaign'))
        body.params.utm_campaign = query.get('utm_campaign');
      if (query.get('utm_content'))
        body.params.utm_content = query.get('utm_content');
      if (query.get('utm_term')) body.params.utm_term = query.get('utm_term');
      if (query.get('b1')) body.params.b1 = query.get('b1');
      if (query.get('b2')) body.params.b2 = query.get('b2');
      if (query.get('b3')) body.params.b3 = query.get('b3');

      let endpoint = '';
      if (offer.payment.type === 'single') {
        endpoint = '/sales/card';
      } else {
        endpoint = '/sales/subscriptions';
        body.plan_id = selectedPlan.uuid;
      }

      body.token = turnstileToken;

      api
        .post(endpoint, body)
        .then(async (r) => {
          const { upsell_url, sale_id } = r.data;
          if (r.data.status.id === 2) {
            if (!sentGoogleAnalystics) {
              pushGTMEvent('purchase', {
                transaction_id: r.data.sale_id,
                currency: 'BRL',
                value: offer.price,
                coupon: coupon?.coupon || undefined,
                shipping: integration_shipping_price || 0,
                items:
                  offer.offerShopify && Array.isArray(offer.offerShopify)
                    ? offer.offerShopify.map((item, index) => ({
                      item_id: item.variant_id,
                      item_name: item.title,
                      index,
                      price: parseFloat(item.price),
                      quantity: item.quantity,
                    }))
                    : [
                      {
                        item_id: offer.product.uuid,
                        item_name: offer.product.name,
                        price: offer.price,
                        quantity: 1,
                      },
                    ],
                user_data: {
                  email: getValues('email'),
                  phone: getValues('whatsapp'),
                  first_name: getValues('full_name'),
                  city: delivery?.localidade,
                  region: delivery?.uf,
                  zip: delivery?.cep,
                  country: 'BR',
                },
                payment_type: 'card',
              });

              setSentGoogleAnalystics(true);
            }

            setError(null);
            setPaymentStatus(true);
            setRequesting(false);
            trackEvent('checkout_payment_success', {
              step: 'payment',
              paymentMethod: 'credit_card',
              email: getValues('email'),
              phone: getValues('whatsapp'),
            });
            trackEvent('checkout_conversion_success', {
              step: 'payment',
              paymentMethod: 'credit_card',
              email: getValues('email'),
              phone: getValues('whatsapp'),
            });

            pixels.forEach(async (item) => {
              if (!sentFbPixel) {
                pixelNativeSingle(item.pixel_id, 'Purchase', {
                  value: offer.price,
                  currency: 'BRL',
                  content_type: 'product',
                  content_ids: [offer.uuid],
                  num_items: 1,
                });
                if (item.token && Cookies.get('_fbc')) {
                  await sendApiEvent('Purchase', item.pixel_uuid, {
                    value: offer.price,
                    currency: 'BRL',
                    content_ids: [offer.uuid],
                    num_items: 1,
                    sale_id,
                  });
                }
                pixelTikTok('CompletePayment', {
                  value: offer.price,
                  currency: 'BRL',
                  content_type: 'product',
                  content_id: offer.uuid,
                  quantity: 1,
                });
              }
            });
            setSentFbPixel(true);
            if (googlePixels.length > 0) {
              if (!sentGoogleAnalystics) {
                if (offer.offerShopify && Array.isArray(offer.offerShopify)) {
                  googlePixels.forEach(() => {
                    googleAnalyticsSend('purchase', {
                      currency: 'BRL',
                      value: offer.price,
                      transaction_id: r.data.sale_id,
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
                  });
                } else {
                  googlePixels.forEach(() => {
                    googleAnalyticsSend('purchase', {
                      currency: 'BRL',
                      value: offer.price,
                      transaction_id: r.data.sale_id,
                      items: [{ item_name: offer.product.name }],
                    });
                  });
                }
              }
              setSentGoogleAnalystics(true);
            }

            if (googleAds.length > 0) {
              googleAds.forEach((item) => {
                if (item.settings.purchase) {
                  try {
                    injectGoogleTagManager(
                      item.settings.pixel_id.split('/')[0]
                    );
                    googleAdsSend({
                      currency: 'BRL',
                      value: offer.price,
                      transaction_id: r.data.sale_id,
                      send_to: `${item.settings.pixel_id}`,
                    });
                  } catch (error) { }
                }
              });
            }
            if (kwaiPixels.length > 0) {
              kwaiPixels.forEach((item) => {
                if (item.settings.purchase) {
                  eventKwaiPixel({
                    event: 'purchase',
                    pixel_id: item.settings.pixel_id,
                    body: {
                      value: offer.price,
                      currency: 'BRL',
                      content_type: 'product',
                      content_id: offer.uuid,
                      num_items: 1,
                      name: offer.product.name,
                    },
                  });
                }
              });
            }

            if (pinterestPixels.length > 0) {
              pinterestPixels.forEach(() =>
                window.pintrk('track', 'purchase', {
                  value: offer.price,
                  currency: 'BRL',
                  order_id: r.data.sale_id,
                  product_ids: [offer.uuid],
                })
              );
            }

            if (offer.offer_upsell_native) {
              navigate(`/upsell-native/${offer.uuid}/${sale_id}`);
              return;
            }

            if (upsell_url) {
              window.location.href = upsell_url;
            } else {
              navigate(`/compra-realizada/${sale_id}`);
            }
          } else {
            let message = r?.data?.cartao_status_details
              ? r?.data?.cartao_status_details
              : r?.data?.status?.name;
            let code = '0000';
            if (r?.data?.status?.code) {
              code = r.data.status.code;
            }
            if (message === 'Negado') {
              message =
                'Entre em contato com o seu banco através do APP ou telefone para desbloqueio e tente novamente após confirmação de cartão desbloqueado';
            }
            setError(
              `Erro ao processar transação: ${message} - Código do erro: ${code}`
            );
            setPaymentStatus(false);
            trackEvent('checkout_payment_error', {
              step: 'payment',
              paymentMethod: 'credit_card',
              email: getValues('email'),
              phone: getValues('whatsapp'),
            });
          }
        })
        .catch((e) => {
          let showMessage = '';
          if (e?.response?.data?.cartao_status_details) {
            showMessage = `${e?.response?.data?.cartao_status_details}`;
          } else {
            showMessage = `${e?.response?.data?.message}`;
            if (e?.response?.data?.body) {
              if (e?.response?.data?.body?.errors?.length > 0) {
                let firstError = e?.response?.data?.body?.errors[0];
                showMessage += `: ${firstError[Object.keys(firstError)[0]]}`;
              }
            }
          }
          setError(showMessage);
          setPaymentStatus(false);
          trackEvent('checkout_payment_error', {
            step: 'payment',
            paymentMethod: 'credit_card',
            email: getValues('email'),
            phone: getValues('whatsapp'),
          });
        })
        .finally(() => {
          setRequesting(false);
          setDisplayChallenge(false);
          setLoading(false);
        });
    };
    fetchApi();
  }, []);

  return (
    <>
      <PageTracker pageCategory='checkout' />
      <Modal.Header closeButton={!requesting}>
        <b>Pagamento com Cartão de Crédito</b>
      </Modal.Header>
      <Modal.Body>
        <div className='modal-card'>
          {requesting && <Requesting />}
          {!requesting && paymentStatus === true && (
            <CardSuccess getValues={getValues} fullName={fullName} />
          )}
          {!requesting && paymentStatus === false && (
            <CardDeclined reason={error} />
          )}
        </div>
      </Modal.Body>
    </>
  );
};

export default ModalCard;
