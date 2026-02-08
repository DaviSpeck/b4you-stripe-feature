import { useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { ModalUpsellPayment } from './modal';
import './style.scss';

export const BtnBuy = ({
  btnTextAccept,
  btnColorAccept,
  btnTextAcceptSize,
  btnTextColorAccept,
  planSelectUuid,
  offerSelectUuid,
  upsellOfferUuid,
  isOneClick,
  onOneClickSubmit,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  function handleClick() {
    if (isOneClick) {
      onOneClickSubmit?.({
        offerSelectUuid,
        planSelectUuid,
        upsellOfferUuid,
      });
      return;
    }

    setIsOpen(true);
  }

  return (
    <>
      <button
        className='btn-buy'
        style={{
          backgroundColor: btnColorAccept,
          fontSize: `${btnTextAcceptSize}px`,
          color: btnTextColorAccept ?? 'white',
        }}
        onClick={handleClick}
        disabled={isLoading}
      >
        <span>{btnTextAccept}</span>
        {isLoading && (
          <AiOutlineLoading3Quarters size={20} className='spin' />
        )}
      </button>

      {!isOneClick && (
        <ModalUpsellPayment
          isOpen={isOpen}
          upsellOfferUuid={upsellOfferUuid}
          planSelectUuid={planSelectUuid}
          offerSelectUuid={offerSelectUuid}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
