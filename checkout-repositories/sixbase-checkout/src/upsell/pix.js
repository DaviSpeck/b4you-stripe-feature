import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import PixCountdown from './pix-countdown';
import PixExpired from './pix-expired';
import api from '../api';
import useQuery from 'query/queryHook';

const Loading = () => {
  return (
    <div className='d-flex flex-column justify-content-center align-items-center'>
      <div className='mt-3 loader'></div>
    </div>
  );
};

const MethodPix = ({ uuidSaleItem, uuidOffer, redirectParent }) => {
  const [pix, setPix] = useState({
    sale_item_id: null,
    base64_qrcode: null,
    qrcode: null,
    status: '',
  });
  const [intervalId, setIntervalId] = useState(null);
  const [timerPix, setTimerPix] = useState(null);
  const [newPix, setNewPix] = useState(false);
  const [pixExpired, setPixExpired] = useState(false);
  const [countDown, setCountDown] = useState(null);
  const query = useQuery();

  useEffect(() => {
    const submitPix = async () => {
      const key = `${uuidOffer}_${uuidSaleItem}`;
      const localPix = localStorage.getItem(key);
      if (localPix) {
        setPix(JSON.parse(localPix));
        return;
      }
      const body = {
        offer_id: uuidOffer,
        sale_item_id: uuidSaleItem,
        payment_method: 'pix',
        installments: 1,
      };

      const plan = query.get('plan');

      if (plan) {
        body.plan_id = plan;
      }

      api
        .post(`/sales/process-upsell`, body)
        .then((response) => {
          const { sale_item_id, qrcode_url, qrcode, status } = response.data;

          const pixData = {
            sale_item_id,
            qrcode,
            qrcode_url,
            status,
          };

          setPix(pixData);
          localStorage.setItem(key, JSON.stringify(pixData));
          /**
           * {
           *  sale_item_id,
           *  status, 'created' (pix), 'paid', 'refused'
           *  base64_qrcode, 'qrcode image'
           *  qrcode 'qrcode string'
           * }
           */
        })
        .catch(() => {
          // redirectParent();
        });
    };
    if ((uuidOffer && uuidSaleItem) || newPix) {
      submitPix();
    }
  }, [uuidSaleItem, uuidOffer]);

  const fetchPixStatus = async () => {
    const body = {
      sale_id: pix.sale_item_id,
    };
    api
      .post(`/sales/pix/status`, body)
      .then((response) => {
        const { status } = response.data;

        if (status === 'confirmed') {
          setPix((prev) => ({ ...prev, status }));
          setTimerPix(null);
          clearInterval(intervalId);
          redirectParent('accept');
          localStorage.clear();
        }
      })
      .catch(() => {});
  };

  const generateNew = () => {
    setPixExpired(false);
    setNewPix(true);
  };

  useEffect(() => {
    if (pix.qrcode_url) {
      // if (!timerPix) {
      setTimerPix(new Date(new Date().getTime() + 5 * 60 * 1000));
      const interval = setInterval(() => {
        fetchPixStatus();
      }, 5000);
      setIntervalId(interval);
    }
    return () => clearInterval(intervalId);
  }, [pix]);

  useEffect(() => {
    let interval = null;
    if (timerPix) {
      interval = setInterval(() => {
        const newCountDown = timerPix - new Date().getTime();
        if (newCountDown <= 0) {
          setCountDown(null);
          setTimerPix(null);
          setPixExpired(true);
        } else {
          setCountDown(newCountDown);
        }
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [timerPix]);

  return (
    <section id='pix'>
      {pixExpired ? (
        <PixExpired generateNew={generateNew} />
      ) : (
        <div className='d-flex'>
          <div className='qr-code'>
            {!pix.qrcode_url ? (
              <Loading />
            ) : (
              <img src={pix.qrcode_url} alt='pix' />
            )}
            {pix.qrcode && (
              <>
                <div className='label-copy'>
                  Clique e copie o código Pix abaixo
                </div>
                <div className='copy' title='Copiar código pix.'>
                  <i className='las la-copy' />
                  <span>{pix.qrcode}</span>
                </div>
              </>
            )}
          </div>
          <div className='instructions'>
            <h4>Pagar com Pix</h4>
            <ul>
              <li>Abra o aplicativo do seu banco no celular</li>
              <li>Selecione a opção de pagar com Pix / Escanear QR Code</li>
              <li>
                <u>
                  <b>Após pagamento, não feche esta página</b>, aguarde até que
                  o pagamento seja reconhecido.
                </u>
              </li>
            </ul>
            <PixCountdown countDown={countDown} />
          </div>
        </div>
      )}
    </section>
  );
};

MethodPix.propTypes = {
  uuidSaleItem: PropTypes.string,
  uuidOffer: PropTypes.string,
  redirectParent: PropTypes.func,
};

export default MethodPix;
