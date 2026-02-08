/* eslint-disable react/no-unescaped-entities */
import api from 'api';
import {
  googleAdsSend,
  eventKwaiPixel,
  pixelNativeSingle,
  cleanDocument,
} from 'functions';
import { useEffect, useRef, useState } from 'react';
import { Row, Col, Modal, Button } from 'react-bootstrap';
import Requesting from 'Requesting';
import { useNavigate } from 'react-router-dom';
import { pixelTikTok } from 'functions';
import { useCheckoutTracking } from './tracking/useCheckoutTracking';
import { resolveFirstImageSrc } from './utils/image';

const ModalPix = ({
  paymentStatus,
  setPaymentStatus,
  setShowModal,
  uuidOffer,
  offer,
  selectedBumps,
  selectedPlan,
  pixels,
  googlePixels,
  googleAds,
  coupon,
  kwaiPixels,
  turnstileToken,
  setDisplayChallenge,
  b4f,
  getValues,
  delivery,
  setLoading,
  integration_shipping_price,
  integration_shipping_company,
  query,
  pinterestPixels,
  checkoutType,
}) => {
  const [requesting, setRequesting] = useState(true);
  const [error, setError] = useState(null);
  const [pixData, setPixData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [togglePix, setTogglePix] = useState(false);
  const [sentFbPixel, setSentFbPixel] = useState(false);
  const [sentGoogleAnalystics, setSentGoogleAnalystics] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  const paymentSuccessSentRef = useRef(false);
  const { trackEvent } = useCheckoutTracking({
    offerId: uuidOffer,
    checkoutType,
  });
  const qrCodeSrc = resolveFirstImageSrc(
    pixData?.base64_qrcode,
    pixData?.qrcode,
    pixData?.qrcode_url
  );

  useEffect(() => {
    const fetch = async () => {
      if (!offer) return;

      let orderBumps = [];

      selectedBumps.forEach((item) => {
        orderBumps.push(item.uuid);
      });

      let body = {
        offer_id: uuidOffer,
        order_bumps: orderBumps,
        coupon: coupon?.coupon,
        token: turnstileToken,
        b4f,
        full_name: getValues('full_name'),
        email: getValues('email'),
        document_number: cleanDocument(getValues('document')),
        whatsapp: getValues('whatsapp'),
        integration_shipping_price,
        integration_shipping_company,
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

      let endpoint = '/sales/pix';
      if (!pixData) {
        if (offer.payment.type === 'subscription') {
          endpoint = '/sales/subscriptions';
          body['plan_id'] = selectedPlan.uuid;
          body['payment_method'] = 'pix';
        }
        api
          .post(endpoint, body)
          .then((r) => {
            setError(null);
            setPixData(r.data);
            localStorage.setItem(
              'pixData',
              JSON.stringify({
                ...r.data,
                has_upsell_native: r.data.has_upsell_native,
                offer: { uuid: offer.uuid, name: offer.offer.name },
              })
            );

            localStorage.setItem(
              'pixels',
              JSON.stringify({
                fbPixels: pixels,
                googleAds,
                kwaiPixels,
              })
            );

            // ============= FACEBOOK ============= //
            if (!sentFbPixel) {
              pixels.forEach((config) => {
                if (config.generated_pix) {
                  pixelNativeSingle(config.pixel_id, 'Purchase', {
                    value: offer.price,
                    currency: 'BRL',
                    content_type: 'product',
                    content_ids: [offer.uuid],
                    num_items: 1,
                  });
                }
              });

              setSentFbPixel(true);
            }


            // ============== KWAI PIXEL EVENT ============== //
            kwaiPixels.forEach((item) => {
              if (item.settings.purchase && item.settings.trigger_pix)
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
            });
            // =============== TIKTOK PIXEL EVENT ============== //
            offer.pixels.tiktok.forEach(({ settings }) => {
              if (settings.trigger_purchase_boleto) {
                pixelTikTok('Purchase', {
                  value: offer.price,
                  currency: 'BRL',
                  content_type: 'product',
                  content_id: offer.uuid,
                  quantity: 1,
                });
              }
            });

            trackEvent('checkout_conversion_success', {
              step: 'payment',
              paymentMethod: 'pix',
              email: getValues('email'),
              phone: getValues('whatsapp'),
            });
            navigate(`/sales/pix/info/${r.data.sale_id}`);
          })
          .catch((e) => {
            const errors = e.response?.data?.body?.errors || [];
            const messages = errors
              .map((error) => Object.values(error))
              .flat()
              .join('. ');
            const errorMessage =
              messages ||
              e.response?.data?.message ||
              e.message ||
              'Erro desconhecido';

            const errorData = {
              error: errorMessage,
              error_type: 'pix_generation_error',
              context: {
                endpoint: endpoint,
                offer_id: uuidOffer,
                offer_name: offer?.offer?.name,
                payment_type: offer?.payment?.type,
                is_subscription: offer?.payment?.type === 'subscription',
                plan_id: selectedPlan?.uuid,
              },
              request_body: body || null,
              response_data: e.response?.data || null,
              response_status: e.response?.status || null,
              timestamp: new Date().toISOString(),
              user_agent: navigator.userAgent,
              url: window.location.href,
            };

            api.post('/errors/log', errorData).catch(() => { });

            setError(errorMessage);
            trackEvent('checkout_payment_error', {
              step: 'payment',
              paymentMethod: 'pix',
              email: getValues('email'),
              phone: getValues('whatsapp'),
            });
          })
          .finally(() => {
            setDisplayChallenge(false);
            setRequesting(false);
            setLoading(false);
          });
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    let intervalId = null;

    if (pixData) {
      intervalId = setInterval(() => {
        checkPixStatus();
      }, 15 * 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pixData]);

  const checkPixStatus = () => {
    if (pixData && pixData.sale_id) {
      let fields = {
        sale_id: pixData.sale_id,
      };

      api.post('/sales/pix/status', fields).then((r) => {
        if (r.data.status === 'expired') {
          setPixData(null);
          setShowModal(false);
        }
        if (r.data.status === 'confirmed') {
          if (r.data.status === 'confirmed') {
            if (!paymentSuccessSentRef.current) {
              trackEvent('checkout_payment_success', {
                step: 'payment',
                paymentMethod: 'pix',
                email: getValues('email'),
                phone: getValues('whatsapp'),
              });
              paymentSuccessSentRef.current = true;
            }

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
                        index,
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

                setSentGoogleAnalystics(true);
              }
            }
          }

          // ============ GOOGLE ADS =========== //
          googleAds.forEach(
            (item) =>
              item.settings.trigger_pix &&
              googleAdsSend({
                currency: 'BRL',
                value: offer.price,
                transaction_id: r.data.sale_id,
                send_to: `${item.settings.pixel_id}`,
              })
          );

          pixels.forEach((item) => {
            if (item.paid_pix && !item.generated_pix) {
              pixelNativeSingle(item.pixel_id, 'Purchase', {
                value: offer.price,
                currency: 'BRL',
                content_type: 'product',
                content_ids: [offer.uuid],
                num_items: 1,
              });
              pixelTikTok('CompletePayment', {
                value: offer.price,
                currency: 'BRL',
                content_type: 'product',
                content_id: offer.uuid,
                quantity: 1,
              });
            }
          });
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
          setPaymentStatus(true);
          redirect();
        }
      });
    }
  };

  const redirect = () => {
    setTimeout(() => {
      navigate(`/sales/pix/info/${pixData.sale_id}`);
    }, 5000);
  };

  const copyToClipboard = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(pixData.pix_code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <>
      <Modal.Header closeButton={!paymentStatus}>
        <div></div>
      </Modal.Header>
      <Modal.Body>
        {requesting && <Requesting />}
        {!requesting &&
          (error === null ? (
            <Row>
              <Col md={12}>
                <div className='modal-pix'>
                  <h3>Siga os passos abaixo para realizar o pagamento:</h3>
                  <div className='content'>
                    <div className='summary'>
                      <ol>
                        <li>
                          <div className='number'>1</div>
                          <span>
                            Copie o código <b>PIX</b>
                          </span>
                        </li>

                        <div className='hide-desk'>
                          <textarea
                            id='pix-code'
                            className='form-control pix-code'
                            defaultValue={pixData.pix_code}
                            onClick={copyToClipboard}
                            ref={ref}
                            readOnly
                          />
                          <div className='list-buttons'>
                            <Button
                              size='sm'
                              onClick={copyToClipboard}
                              variant={!copied ? 'primary' : 'success'}
                            >
                              {!copied ? (
                                <>
                                  <i className='la la-copy mr-2' />{' '}
                                  <span>Copiar código PIX</span>
                                </>
                              ) : (
                                <span>Copiado! :)</span>
                              )}
                            </Button>
                            <Button
                              size='sm'
                              variant={'primary'}
                              className='outline'
                              onClick={() => setTogglePix(!togglePix)}
                            >
                              <i className='las la-qrcode mr-2' />
                              <span>Ver QRCode</span>
                            </Button>
                          </div>
                          {togglePix && (
                            <div className='pix-photo'>
                              {qrCodeSrc && (
                                <img
                                  src={qrCodeSrc}
                                  className='img-fluid'
                                  style={{ border: '1px solid #eee' }}
                                  alt='QRCode Pix'
                                />
                              )}
                            </div>
                          )}
                        </div>
                        <li>
                          <div className='number'>2</div>
                          <span>Abra o aplicativo do seu banco favorito</span>
                        </li>
                        <li>
                          <div className='number'>3</div>
                          <span>
                            Na seção de PIX, selecione a opção "
                            <b>Pix Copia e Cola</b>"
                          </span>
                        </li>
                        <li>
                          <div className='number'>4</div>
                          <span>Cole o código</span>
                        </li>
                        <li>
                          <div className='number'>5</div>
                          <span>Confirme o pagamento</span>
                        </li>
                      </ol>
                    </div>
                    <div className='qr-code'>
                      {pixData && (
                        <>
                          <div className='pix-data'>
                            <Button
                              size='sm'
                              onClick={copyToClipboard}
                              variant={!copied ? 'primary' : 'success'}
                            >
                              {!copied ? (
                                <>
                                  <i className='la la-copy mr-2' /> Copiar
                                  código PIX
                                </>
                              ) : (
                                'Copiado! :)'
                              )}
                            </Button>
                            {qrCodeSrc && (
                              <img
                                src={qrCodeSrc}
                                className='img-fluid'
                                style={{ border: '1px solid #eee' }}
                                alt='QRCode Pix'
                              />
                            )}
                            {/*   <textarea
                            id='pix-code'
                            className='form-control pix-code'
                            defaultValue={pixData.pix_code}
                            onClick={copyToClipboard}
                            ref={ref}
                            readOnly
                          /> */}
                          </div>
                        </>
                      )}

                      {!paymentStatus ? (
                        <div className='waiting-payment'>
                          <i className='la la-circle-notch la-spin mr-2' />
                          <span>Aguardando pagamento...</span>
                        </div>
                      ) : (
                        <div className='payment-confirmed'>
                          <i className='la la-check mr-2' />
                          <span>Pagamento confirmado!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          ) : (
            <>
              Erro ao gerar pix.
              <br />
              <b>{error}</b>
            </>
          ))}
      </Modal.Body>
    </>
  );
};

export default ModalPix;
