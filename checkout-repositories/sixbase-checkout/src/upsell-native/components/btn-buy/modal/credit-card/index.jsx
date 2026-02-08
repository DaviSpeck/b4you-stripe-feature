/* eslint-disable react/display-name */
import { MdErrorOutline } from 'react-icons/md';
import { CardCurrentInformation } from './current-card';
import './style.scss';
import { NewCard } from './new-card';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export function CreditCardOption(props) {
  const {
    creditCardData,
    isPaymentProcess,
    isPaymentSuccess,
    isErrorPayment,
    offerSelectUuid,
    planSelectUuid,
    upsellOfferUuid,
    onErrorPayment,
    onGeneratePix,
    onPaymentSuccess,
    onProcess,
  } = props;

  const [optionSelect, setOptionSelect] = useState('current-card');

  useEffect(() => {
    setOptionSelect('current-card');
    onErrorPayment(false);
  }, [creditCardData]);

  function handleSelect(option) {
    onErrorPayment(false);
    setOptionSelect(option);
  }

  return (
    <div className='wrapper-card-option'>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          gap: isPaymentProcess || isPaymentSuccess ? '2px' : '8px',
          padding: isPaymentProcess || isPaymentSuccess ? '20px' : '0px',
        }}
      >
        {isPaymentProcess && (
          <div className='wrapper-payment-process'>
            <AiOutlineLoading3Quarters size={25} className='loading-payment' />
            <span className='label-payment-process'>
              Pagamento está sendo processado...
            </span>
          </div>
        )}

        {isErrorPayment && (
          <CreditCardOption.Refuse
            onReview={() => onErrorPayment(false)}
            onGeneratePix={onGeneratePix}
          />
        )}

        {!isPaymentSuccess && !isPaymentProcess && !isErrorPayment && (
          <>
            <CardCurrentInformation
              creditCardData={creditCardData}
              isSelect={optionSelect === 'current-card'}
              offerSelectUuid={offerSelectUuid}
              planSelectUuid={planSelectUuid}
              upsellOfferUuid={upsellOfferUuid}
              onError={onErrorPayment}
              onProcess={onProcess}
              onPaymentSucces={onPaymentSuccess}
              onSelect={() => handleSelect('current-card')}
            />

            <NewCard
              creditCardData={creditCardData}
              isSelect={optionSelect === 'new-card'}
              offerSelectUuid={offerSelectUuid}
              planSelectUuid={planSelectUuid}
              upsellOfferUuid={upsellOfferUuid}
              onErrorPayment={onErrorPayment}
              onSelect={() => handleSelect('new-card')}
              onProcess={onProcess}
              onPaymentSucces={onPaymentSuccess}
            />
          </>
        )}
      </div>
    </div>
  );
}

CreditCardOption.Refuse = function ({ onGeneratePix, onReview }) {
  return (
    <>
      <div className='wrapper-payment-error'>
        <div className='wrapper-header-payment-error'>
          <MdErrorOutline size={80} color='#d10b01' />
          <h2>Não foi possível finalizar a sua compra!</h2>
        </div>
        <span className='subtitle-payment-error'>
          Não foi possível concluir a compra. Verifique os dados do cartão e
          tente novamente.
        </span>
      </div>

      <div className='wrapper-payment-error-action'>
        <div>
          <button className='w-full cursor-pointer' onClick={onGeneratePix}>
            Gerar Pix
          </button>
          <button className='w-full cursor-pointer' onClick={onReview}>
            Tentar com outro cartão
          </button>
        </div>

        <p className='text-[0.75rem] font-medium'>
          Se o problema persistir,{' '}
          <a
            href='https://jivo.chat/5dZIrICX0F'
            className='text-[#0B4CC4] underline underline-offset-2'
          >
            entre em contato com nossa equipe de suporte
          </a>
        </p>
      </div>
    </>
  );
};
