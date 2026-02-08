import api from 'api';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../images/logo-horizontal.png';
import logoPix from '../images/logopix.png';
import { resolveFirstImageSrc } from '../utils/image';
import {
  currency,
  eventKwaiPixel,
  googleAdsSend,
  pixelNativeSingle,
  pushGTMEvent,
} from '../functions';

const SalesInfoPix = () => {
  const { uuidSaleItem } = useParams();
  const [pixData, setPixData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(false);

  const [fbPixels, setFbPixels] = useState([]);
  const [googleAds, setGoogleAds] = useState([]);
  const [kwaiPixels, setKwaiPixels] = useState([]);
  const qrCodeSrc = resolveFirstImageSrc(
    pixData?.base64_qrcode,
    pixData?.qrcode,
    pixData?.qrcode_url
  );

  const ref = useRef(null);
  const navigate = useNavigate();

  const fetchData = () => {
    const data = JSON.parse(localStorage.getItem('pixData'));
    const pixels = JSON.parse(localStorage.getItem('pixels'));

    if (data && data.sale_id === uuidSaleItem) {
      if (pixels) {
        setFbPixels(
          pixels.fbPixels.map((p) => ({
            settings: {
              pixel_id: p.pixel_id,
              token: p.token,
              paid_pix: p.paid_pix,
            },
          }))
        );
        setGoogleAds(pixels.googleAds || []);
        setKwaiPixels(pixels.kwaiPixels || []);
      }
      setPixData(data);
      setLoading(false);
      return;
    }

    api
      .get(`sales/pix/info/${uuidSaleItem}`)
      .then((r) => {
        const { pixels } = r.data;
        setFbPixels(pixels.facebook || []);
        setGoogleAds(pixels['google-ads'] || []);
        setKwaiPixels(pixels.kwai || []);
        setPixData(r.data);
        setLoading(false);
      })
      .catch(() => { });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!pixData) return;

    const intervalId = setInterval(() => {
      checkPixStatus();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [pixData]);

  const sendPixels = () => {
    // Google Ads (conversion)
    for (const item of googleAds) {
      if (item.settings?.purchase) {
        googleAdsSend({
          send_to: item.settings.pixel_id,
          value: pixData.price,
          currency: 'BRL',
          transaction_id: uuidSaleItem,
        });
      }
    }

    // Kwai
    for (const item of kwaiPixels) {
      if (item.settings?.purchase && item.settings?.trigger_pix) {
        eventKwaiPixel({
          event: 'purchase',
          pixel_id: item.settings.pixel_id,
          body: {
            value: pixData.price,
            currency: 'BRL',
            content_type: 'product',
            content_id: pixData.offer.uuid,
            num_items: 1,
            name: pixData.offer.name,
          },
        });
      }
    }

    // Facebook
    for (const item of fbPixels) {
      if (item.settings?.paid_pix && !item.settings?.token) {
        window.fbq('init', item.settings.pixel_id);
        pixelNativeSingle(item.settings.pixel_id, 'Purchase', {
          value: pixData.price,
          currency: 'BRL',
          content_type: 'product',
          content_ids: [pixData.offer.uuid],
          num_items: 1,
        });
      }
    }
  };

  const checkPixStatus = () => {
    if (!pixData || !uuidSaleItem) return;

    api.post('/sales/pix/status', { sale_id: uuidSaleItem }).then((r) => {
      if (r.data.status === 'expired') {
        setPixData(null);
        return;
      }

      if (r.data.status === 'confirmed') {

        pushGTMEvent('purchase', {
          currency: 'BRL',
          value: pixData.price,
          transaction_id: uuidSaleItem,
          payment_method: 'pix',
          customer_email: pixData.student?.email || null,
          customer_name: pixData.student?.full_name || null,
          customer_city: pixData.student?.address?.city || null,
          customer_state: pixData.student?.address?.state || null,
          customer_zipcode: pixData.student?.address?.zipcode || null,
          items: [
            {
              item_id: pixData.offer.uuid,
              item_name: pixData.offer.name,
              price: pixData.price,
              quantity: 1,
            },
          ],
        });

        sendPixels();
        setPaymentStatus(true);
        redirect();
      }
    });
  };

  const redirect = () => {
    setTimeout(() => {
      if (pixData?.has_upsell_native) {
        navigate(`/upsell-native/${pixData.offer.uuid}/${uuidSaleItem}`);
        return;
      }

      if (pixData?.upsell_url) {
        window.location.href = pixData.upsell_url;
        return;
      }

      navigate(`/compra-realizada/${uuidSaleItem}`);
    }, 5000);
  };

  const copyToClipboard = (e) => {
    e.preventDefault();
    ref.current.select();
    navigator.clipboard.writeText(pixData.pix_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div id='wrap-info-pix'>
      <div className='modal-pix'>
        <div className='header-pix'>
          <div className='d-flex flex-2 align-items-center'>
            Valor do pedido:{' '}
            {pixData?.price ? (
              <div className='primary ml-1'>{currency(pixData?.price)}</div>
            ) : (
              <div className='loader ml-2'></div>
            )}
          </div>
          <div className='logo-pix'>
            <img src={logoPix} alt='Pix' />
          </div>
        </div>
        <div className='hr'></div>
        <ul className='ul'>
          <li>
            <div className='icon'>1</div>Copie o código abaixo
          </li>
          <li>
            <div className='icon'>2</div>
            <div>
              Abra o aplicativo do seu banco e cole o código na função{' '}
              <span className='b'>PIX Copia e Cola</span>
            </div>
          </li>
          <li>
            <div className='icon'>3</div>Confirme o pagamento
          </li>
        </ul>
        {pixData && (
          <>
            <div className='wrap-pix-code'>
              <input
                id='pix-code'
                className='form-control'
                defaultValue={pixData?.pix_code}
                onClick={copyToClipboard}
                ref={ref}
                readOnly
              />
              <Button
                size='sm'
                onClick={copyToClipboard}
                variant={'success'}
                className='btn w-100'
              >
                {!copied ? (
                  <>
                    <i className='la la-copy mr-2' /> Copiar código (PIX Copia e
                    Cola)
                  </>
                ) : (
                  <>
                    <i className='las la-check mr-2'></i> Código PIX copiado
                  </>
                )}
              </Button>
            </div>
          </>
        )}
        <div className='hr'></div>
        <h3>
          <b>Você também pode ler o QRCode abaixo</b>
        </h3>
        <ul className='ul mt-4'>
          <li>
            <div className='icon'>1</div>
            Abra o aplicativo do seu banco no celular
          </li>
          <li>
            <div className='icon'>2</div>
            Selecione a opção pagar com PIX e Ler QRCode
          </li>
          <li>
            <div className='icon'>3</div>
            Leia o QRCode e confirme o pagamento
          </li>
        </ul>
        <div className='qr-code'>
          {pixData && qrCodeSrc && (
            <img
              src={qrCodeSrc}
              className='img-fluid'
              style={{ border: '1px solid #eee' }}
              alt='QRCode Pix'
            />
          )}

          {loading ? (
            <div className='waiting-payment'>
              <div className='loader mr-2'></div>
              <span>Carregando...</span>
            </div>
          ) : pixData && !paymentStatus ? (
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
        <p className='mt-2 text-center text-email'>
          Após o pagamento, você receberá um email com a confirmação da sua
          compra{' '}
        </p>
        <div className='logo'>
          <img src={logo} alt='B4you' />
        </div>
      </div>
    </div>
  );
};

export default SalesInfoPix;
