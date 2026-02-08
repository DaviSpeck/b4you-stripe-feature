import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { QrCodeComponent } from './qrCode';
import { TimerComponent } from './timer';
import './style.scss';
import { useEffect, useState, useCallback, useRef } from 'react';
import api from 'api';
import { useParams } from 'react-router-dom';

export function PixOption(props) {
  const {
    paymentSelect,
    offerSelectUuid,
    planSelectUuid,
    upsellOfferUuid,
    onPaymentSuccess,
  } = props;

  const { uuidOffer, uuidSaleItem } = useParams();
  const PIX_STORAGE_KEY = `pix_data_${uuidSaleItem}`;

  const [pixData, setPixData] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const pixStatusRef = useRef(null);

  const getPix = useCallback(async () => {
    try {
      setIsPending(true);

      const offerUuid =
        offerSelectUuid ?? upsellOfferUuid ?? uuidOffer;

      if (!offerUuid || !uuidSaleItem) return;

      const { data } = await api.post(
        `/upsell-native/${offerUuid}/payment/pix`,
        {
          sale_item_id: uuidSaleItem,
          plan_selected_uuid: planSelectUuid ?? null,
          offer_selected_uuid: offerUuid,
        }
      );

      const pixPayload = data?.pixData ?? null;

      setPixData(pixPayload);
      localStorage.setItem(
        PIX_STORAGE_KEY,
        JSON.stringify(pixPayload)
      );
    } catch {
      // silencioso
    } finally {
      setIsPending(false);
    }
  }, [
    offerSelectUuid,
    planSelectUuid,
    upsellOfferUuid,
    uuidOffer,
    uuidSaleItem,
  ]);

  const pixStatus = useCallback(async () => {
    try {
      const saleId =
        pixData?.pixData?.sale_id ??
        pixData?.sale_id ??
        uuidSaleItem;

      if (!saleId) return;

      const { data } = await api.post('/sales/pix/status', {
        sale_id: saleId,
      });

      if (data.status === 'confirmed') {
        setIsPaid(true);
        localStorage.removeItem(PIX_STORAGE_KEY);
        onPaymentSuccess(true);
      }

      if (data.status === 'expired') {
        localStorage.removeItem(PIX_STORAGE_KEY);
        getPix();
      }
    } catch {
      // mantém polling
    }
  }, [pixData, uuidSaleItem, getPix, onPaymentSuccess]);

  useEffect(() => {
    pixStatusRef.current = pixStatus;
  }, [pixStatus]);

  useEffect(() => {
    if (paymentSelect !== 'pix') {
      setPixData(null);
      setIsPaid(false);
      setIsPending(false);
      return;
    }

    const storedPix = localStorage.getItem(PIX_STORAGE_KEY);

    if (storedPix) {
      setPixData(JSON.parse(storedPix));
      setIsPending(false);
    } else {
      getPix();
    }
  }, [paymentSelect, getPix]);

  useEffect(() => {
    if (!pixData || isPaid || paymentSelect !== 'pix') return;

    const interval = setInterval(() => {
      pixStatusRef.current?.();
    }, 15000);

    return () => clearInterval(interval);
  }, [pixData, isPaid, paymentSelect]);

  if (isPending) {
    return (
      <div className='flex h-full w-full items-center justify-center py-10'>
        <AiOutlineLoading3Quarters size={40} className='animate-spin' />
      </div>
    );
  }

  if (isPaid) {
    return (
      <div className='flex h-[calc(100vh-100px)] w-full flex-col items-center justify-center'>
        <img src='/shopping-bag.gif' width={160} height={160} alt='' />
        <h1 className='text-[1.5rem] font-normal'>
          Pagamento realizado com sucesso!
        </h1>
      </div>
    );
  }

  if (!pixData) return null;

  return (
    <div className='wrapper-pix-upsell'>
      {Number.isFinite(pixData?.price) && (
        <div className='wrapper-pix-price'>
          <span>Valor do pedido:</span>
          <strong>
            {pixData.price.toLocaleString('pt-br', {
              currency: 'BRL',
              style: 'currency',
            })}
          </strong>
        </div>
      )}

      <QrCodeComponent
        qrCodeImage={pixData.pixData?.qrcode_url}
        qrCode={pixData.pixData?.qrcode}
      />

      <div className='wrapper-instruction-pix'>
        <div className='wrapper'>
          <h1>Pagar com Pix</h1>
          <ul className='flex list-inside list-disc flex-col gap-2 text-[0.85rem] text-[#505050]'>
            <li>Abra o aplicativo do seu banco no celular</li>
            <li>Selecione a opção de pagar com Pix / Escanear QR Code</li>
            <li className='undeline-text-instruction'>
              <span>Após pagamento, não feche esta página</span>, aguarde até
              que o pagamento seja reconhecido.
            </li>
          </ul>
        </div>

        <TimerComponent />
      </div>
    </div>
  );
}