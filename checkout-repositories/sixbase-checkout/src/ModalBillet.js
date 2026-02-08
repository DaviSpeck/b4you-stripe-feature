import { useEffect, useState } from 'react';
import { Row, Col, Modal, Button, Alert } from 'react-bootstrap';
import api from 'api';
import Requesting from 'Requesting';
import {
  currency,
  googleAdsSend,
  eventKwaiPixel,
  pixelNativeSingleCustom,
  cleanDocument,
  pixelTikTok,
  pixelNativeSingle,
} from 'functions';
import { googleAnalyticsSend } from 'functions';
import { sendApiEvent } from './utils/pixels/facebookAPiConversion';
import Cookies from 'js-cookie';
import { useCheckoutTracking } from './tracking/useCheckoutTracking';
import { resolveFirstImageSrc } from './utils/image';

const ModalBillet = ({
  uuidOffer,
  selectedBumps,
  fbPixels,
  googlePixels,
  googleAds,
  offer,
  coupon,
  kwaiPixels,
  pinterestPixels,
  turnstileToken,
  setDisplayChallenge,
  b4f,
  getValues,
  delivery,
  setLoading,
  integration_shipping_price,
  integration_shipping_company,
  query,
  checkoutType,
}) => {
  const [requesting, setRequesting] = useState(true);
  const [error, setError] = useState(null);
  const [billetData, setBilletData] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sentFbPixel, setSentFbPixel] = useState(false);
  const [barcodeLoaded, setBarcodeLoaded] = useState(false);
  const { trackEvent } = useCheckoutTracking({
    offerId: uuidOffer,
    checkoutType,
  });
  const barcodeSrc = resolveFirstImageSrc(
    billetData?.bar_code_base64,
    billetData?.barcode_base64,
    billetData?.bar_code,
    billetData?.barcode,
    billetData?.bar_code_url,
    billetData?.barcode_url
  );

  useEffect(() => {
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

    api
      .post('/sales/billet', body)
      .then((r) => {
        setError(null);
        setBilletData(r.data);
        setDueDate(r.data.due);
        trackEvent('checkout_conversion_success', {
          step: 'payment',
          paymentMethod: 'boleto',
          email: getValues('email'),
          phone: getValues('whatsapp'),
        });
        trackEvent('checkout_payment_success', {
          step: 'payment',
          paymentMethod: 'boleto',
          email: getValues('email'),
          phone: getValues('whatsapp'),
        });
        if (googlePixels.length > 0) {
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
        if (googleAds.length > 0) {
          googleAds.forEach((item) => {
            if (item.settings.purchase && item.settings.trigger_boleto)
              googleAdsSend({
                currency: 'BRL',
                value: offer.price,
                transaction_id: r.data.sale_id,
                send_to: `${item.settings.pixel_id}`,
              });
          });
        }
        if (kwaiPixels.length > 0) {
          kwaiPixels.forEach((item) => {
            if (item.settings.purchase && item.settings.trigger_boleto)
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
        }

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

        // ============= FACEBOOK ============= //
        if (!sentFbPixel) {
          offer.pixels.facebook.forEach((config) => {
            if (config.settings.generated_pix) {
              pixelNativeSingle(config.pixel_id, 'purchase', {
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
      })
      .catch((e) => {
        setError(e.response.data);
        trackEvent('checkout_payment_error', {
          step: 'payment',
          paymentMethod: 'boleto',
          email: getValues('email'),
          phone: getValues('whatsapp'),
        });
      })
      .finally(() => {
        setDisplayChallenge(false);
        setRequesting(false);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (billetData) {
      if (fbPixels && !sentFbPixel) {
        fbPixels.forEach(async (item) => {
          pixelNativeSingleCustom(item.pixel_id, 'Boleto', {
            currency: 'BRL',
            value: billetData.amount,
            order_id: billetData.sale_id,
          });
          if (item.token && Cookies.get('_fbc')) {
            await sendApiEvent('Boleto', item.pixel_uuid, {
              value: offer.price,
              currency: 'BRL',
              content_ids: [offer.uuid],
              num_items: 1,
              sale_id: r.data.sale_id,
            });
          }
        });
        setSentFbPixel(true);
      }
    }
  }, [billetData, fbPixels]);

  const formatLineCode = (lineCode) => {
    if (!lineCode) return '';

    // Remove any non-numeric characters
    const cleanCode = lineCode.replace(/\D/g, '');

    // Format as: 00000.00000 00000.000000 00000.000000 0 00000000000000
    if (cleanCode.length === 47) {
      return cleanCode.replace(
        /(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d{14})/,
        '$1.$2 $3.$4 $5.$6 $7 $8'
      );
    }

    // If not 47 digits, return original
    return lineCode;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(billetData.line_code);

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <>
      <Modal.Header closeButton={!requesting}>
        <b>Pagamento com Boleto Bancário</b>
      </Modal.Header>
      <Modal.Body>
        {requesting && <Requesting />}
        {!requesting && billetData !== null && (
          <Row>
            <Col md={12}>
              <div className='modal-billet'>
                <div className='actions'>
                  <a
                    href={billetData.url}
                    target='_blank'
                    rel='noreferrer'
                    className='btn btn-primary'
                  >
                    <i className='las la-print' />
                    Imprimir boleto
                  </a>
                  <Button
                    onClick={copyToClipboard}
                    variant={!copied ? 'primary' : 'success'}
                  >
                    <i className='las la-copy' />

                    {!copied ? <>Copiar linha digitável</> : 'Copiado!'}
                  </Button>
                </div>
                <div className='mobile'></div>
                <div className='info'>
                  <div>
                    <span className='title'>Valor</span>
                    <span className='value'>{currency(billetData.amount)}</span>
                  </div>
                  <div>
                    <span className='title'>Vencimento</span>
                    <span className='value'>{dueDate}</span>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    height: 'auto',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      padding: '16px',
                    }}
                  >
                    {!barcodeLoaded && barcodeSrc && (
                      <div
                        className='d-flex justify-content-center align-items-center'
                        style={{ minHeight: '100px' }}
                      >
                        <div
                          className='spinner-border text-primary'
                          role='status'
                        >
                          <span className='visually-hidden'>Loading...</span>
                        </div>
                      </div>
                    )}
                    {barcodeSrc ? (
                      <img
                        src={barcodeSrc}
                        alt='Código de barras do boleto'
                        style={{
                          display: barcodeLoaded ? 'block' : 'none',
                          height: '80px',
                          width: '100%',
                        }}
                        onLoad={() => setBarcodeLoaded(true)}
                      />
                    ) : (
                      <div className='text-center text-muted'>
                        Código de barras indisponível.
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className='desktop-line text-center'
                  style={{
                    display: 'block',
                  }}
                >
                  {formatLineCode(billetData.line_code)}
                </div>
                <div className='instructions'>
                  <span className='title'>Instruções</span>
                  <ul>
                    <li>Você acaba de receber este boleto em seu e-mail.</li>
                    <li>
                      Pagamentos com Boleto Bancário levam até 3 dias úteis para
                      serem compensados e então terem os produtos liberados.
                    </li>
                    <li>
                      Atente-se ao vencimento do boleto. Você pode pagar o
                      boleto em qualquer banco ou casa lotérica até o dia do
                      vencimento.
                    </li>
                    <li>
                      Depois do pagamento, verifique seu e-mail para receber os
                      dados de acesso ao produto (verifique também a caixa de
                      SPAM).
                    </li>
                    <li>
                      <b>Quer receber acesso instantâneo à seu produto?</b>{' '}
                      Escolha pagamento por cartão de crédito ou pix.
                    </li>
                  </ul>
                </div>
              </div>
            </Col>
          </Row>
        )}
        {error && (
          <div className='modal-billet'>
            <div className='billet-declined'>
              <div className='text-center'>
                <i className='la la-frown great' style={{ fontSize: '60px' }} />
                <h4>Oops, pera aí</h4>
              </div>
              <p>Sua compra não pode ser concluída.</p>
              <p>
                <Alert variant='danger'>{error.message}</Alert>
              </p>
              <p>Feche esta janela e tente novamente...</p>
              <small>
                Se o problema persistir{' '}
                <a href='https://b4you.com.br/' target='blank'>
                  entre em contato com nosso suporte.
                </a>{' '}
              </small>
            </div>
          </div>
        )}
      </Modal.Body>
    </>
  );
};

export default ModalBillet;
