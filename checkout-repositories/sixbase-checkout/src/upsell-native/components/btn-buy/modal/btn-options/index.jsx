import { GoCreditCard } from 'react-icons/go';
import { MdPix } from 'react-icons/md';
import './style.scss';

export const PaymentOption = ({
  paymentType,
  cardData,
  pixData,
  onSelect,
}) => {
  return (
    <div className='options-payment-container'>
      {cardData && (
        <PaymentOption.Item
          icon={<GoCreditCard />}
          type='credit_card'
          paymentType={paymentType}
          label='Cartão de crédito'
          discount={cardData.originalPrice - cardData.price}
          price={cardData.price}
          onSelect={onSelect}
        />
      )}

      {pixData && (
        <PaymentOption.Item
          icon={<MdPix size={17} />}
          type='pix'
          paymentType={paymentType}
          label='Pix'
          discount={pixData.originalPrice - pixData.price}
          price={pixData.price}
          onSelect={onSelect}
        />
      )}
    </div>
  );
};

// eslint-disable-next-line react/display-name
PaymentOption.Item = function ({
  icon,
  paymentType,
  type,
  label,
  price,
  discount,
  onSelect,
}) {
  const isSelected = paymentType === type;

  return (
    <button
      type='button'
      className='wrapper-payment-item'
      onClick={() => onSelect(type)}
    >
      <div className='payment-title-item'>
        <div className='icon-title'>
          {icon}
          {label}
        </div>

        <input type='checkbox' checked={isSelected} readOnly />
      </div>

      <span className='price'>
        <span className='font-medium' style={{ paddingRight: 4 }}>
          Total:
        </span>
        {price.toLocaleString('pt-br', {
          currency: 'BRL',
          style: 'currency',
        })}
      </span>

      {discount > 0 && (
        <span className='wrapper-discount'>
          Economize{' '}
          {discount.toLocaleString('pt-br', {
            currency: 'BRL',
            style: 'currency',
          })}
        </span>
      )}
    </button>
  );
};
