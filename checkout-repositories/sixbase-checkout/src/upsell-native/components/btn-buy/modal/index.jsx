import { Modal } from 'react-bootstrap';
import { IoIosClose } from 'react-icons/io';
import './style.scss';
import { PaymentOption } from './btn-options';
import { CreditCardOption } from './credit-card';
import { useEffect, useState } from 'react';
import { PixOption } from './pix';
import { BiSolidCheckCircle } from 'react-icons/bi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from 'Loader';
import api from 'api';

export function ModalUpsellPayment(props) {
  const {
    isOpen,
    onClose,
    planSelectUuid,
    offerSelectUuid,
    upsellOfferUuid,
  } = props;

  const { uuidSaleItem, uuidOffer } = useParams();
  const navigate = useNavigate();

  const [paymentTypeSelect, setPaymentTypeSelect] = useState('credit_card');
  const [creditCardData, setCreditCardData] = useState(null);
  const [pixData, setPixData] = useState(null);

  const [isGettingInfo, setIsGettingInfo] = useState(false);
  const [isPaymentProcess, setIsPaymentProcess] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [isErrorPayment, setIsErrorPayment] = useState(false);

  function resetState() {
    setPaymentTypeSelect('credit_card');
    setCreditCardData(null);
    setPixData(null);
    setIsGettingInfo(false);
    setIsPaymentProcess(false);
    setIsPaymentSuccess(false);
    setIsErrorPayment(false);
  }

  const getOfferData = async () => {
    try {
      setIsGettingInfo(true);

      const offerUuid =
        offerSelectUuid ?? upsellOfferUuid ?? uuidOffer;

      if (!offerUuid || !uuidSaleItem) {
        throw new Error('uuidOffer ou uuidSaleItem ausente');
      }

      const { data } = await api.post(
        `/upsell-native/${offerUuid}/payment`,
        {
          plan_selected_uuid: planSelectUuid,
          offer_selected_uuid: offerSelectUuid ?? upsellOfferUuid ?? uuidOffer,
          upsell_offer_uuid: upsellOfferUuid,
          sale_item_id: uuidSaleItem,
        }
      );

      setCreditCardData(data?.creditCardData ?? null);
      setPixData(data?.pixData ?? null);
    } catch (error) {
      setIsErrorPayment(true);
    } finally {
      setIsGettingInfo(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    resetState();
    getOfferData();
  }, [isOpen]);

  useEffect(() => {
    if (!isPaymentSuccess) return;

    const timer = setTimeout(() => {
      navigate(`/compra-realizada/${uuidSaleItem}`, { replace: true });
    }, 4000);

    return () => clearTimeout(timer);
  }, [isPaymentSuccess, uuidSaleItem, navigate]);

  return (
    <Modal
      id='modal'
      show={isOpen}
      onHide={onClose}
      backdrop='static'
      keyboard={false}
      centered
      className='modal-payment'
    >
      {isGettingInfo && (
        <div style={{ padding: '120px' }}>
          <Loader title={''} spinner={true} />
        </div>
      )}

      {!isGettingInfo && (
        <div className='modal-payment-upsell-native'>
          {!isPaymentProcess && !isPaymentSuccess && !isErrorPayment && (
            <header className='header-upsell-payment-modal'>
              <h1>Pagamento</h1>
              <button onClick={onClose}>
                <IoIosClose />
              </button>
            </header>
          )}

          <main>
            {!isPaymentProcess && !isPaymentSuccess && !isErrorPayment && (
              <PaymentOption
                paymentType={paymentTypeSelect}
                cardData={creditCardData}
                pixData={pixData}
                onSelect={setPaymentTypeSelect}
              />
            )}

            {paymentTypeSelect === 'credit_card' && (
              <CreditCardOption
                creditCardData={creditCardData}
                isPaymentProcess={isPaymentProcess}
                isPaymentSuccess={isPaymentSuccess}
                isErrorPayment={isErrorPayment}
                offerSelectUuid={offerSelectUuid}
                planSelectUuid={planSelectUuid}
                upsellOfferUuid={upsellOfferUuid}
                onReview={onClose}
                onGeneratePix={() => {
                  setIsErrorPayment(false);
                  setPaymentTypeSelect('pix');
                }}
                onPaymentSuccess={setIsPaymentSuccess}
                onProcess={setIsPaymentProcess}
                onErrorPayment={setIsErrorPayment}
              />
            )}

            {paymentTypeSelect === 'pix' && (
              <PixOption
                paymentSelect={paymentTypeSelect}
                offerSelectUuid={offerSelectUuid}
                planSelectUuid={planSelectUuid}
                upsellOfferUuid={upsellOfferUuid}
                onPaymentSuccess={setIsPaymentSuccess}
              />
            )}

            {isPaymentSuccess && <ModalUpsellPayment.PaymentSuccess />}
          </main>
        </div>
      )}
    </Modal>
  );
}

// eslint-disable-next-line react/display-name
ModalUpsellPayment.PaymentSuccess = function () {
  return (
    <>
      <div className='wrapper-payment-success'>
        <div className='wrapper-header-payment-success'>
          <BiSolidCheckCircle size={80} color='#00A31E' />
          <h2>Pagamento realizado com sucesso!</h2>
        </div>
        <span className='subtitle-payment-success'>
          Você será redirecionado em instantes.
        </span>
      </div>

      <div className='wrapper-page-redirect'>
        <AiOutlineLoading3Quarters size={16} className='loading-payment' />
      </div>
    </>
  );
};
