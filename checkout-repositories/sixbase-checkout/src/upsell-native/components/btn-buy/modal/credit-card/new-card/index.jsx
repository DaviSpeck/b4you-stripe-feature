import { IoIosCheckmarkCircle } from 'react-icons/io';
import { CardForm } from './form';
import './style.scss';

export function NewCard(props) {
  const {
    creditCardData,
    isSelect,
    offerSelectUuid,
    planSelectUuid,
    upsellOfferUuid,
    onErrorPayment,
    onSelect,
    onProcess,
    onPaymentSucces,
  } = props;

  return (
    <div className='wrapper-new-card'>
      <div className='wrapper-information'>
        {isSelect ? (
          <IoIosCheckmarkCircle size={23} color='#020246' />
        ) : (
          <button
            type='button'
            className='btn-select-card'
            onClick={onSelect}
          />
        )}

        <div className='wrapper-text'>
          <h3>Novo cartão de crédito</h3>
          <p>Cadastre um novo cartão de crédito para a compra</p>
        </div>
      </div>

      {isSelect && (
        <CardForm
          creditCardData={creditCardData}
          offerSelectUuid={offerSelectUuid}
          planSelectUuid={planSelectUuid}
          upsellOfferUuid={upsellOfferUuid}
          onErrorPayment={onErrorPayment}
          onProcess={onProcess}
          onPaymentSucces={onPaymentSucces}
        />
      )}
    </div>
  );
}
