import { useEffect } from 'react';
import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import { IoImageOutline } from 'react-icons/io5';
import './style.scss';

export const MultiOffers = ({
  offers,
  offerSelected,
  isOneClick,
  onSelect,
}) => {
  useEffect(() => {
    if (!offers?.length) return;

    const exists = offers.some((item) => item.uuid === offerSelected);

    if (!exists && offers[0]?.uuid) {
      onSelect(offers[0].uuid);
    }
  }, [offers, offerSelected, onSelect]);

  if (!offers?.length) return null;

  return (
    <div className='multi-offers-container'>
      {offers.map((item) => {
        const offerTitle =
          item.offer?.alternative_name || item.offer?.name;

        const offerImage =
          item?.customizations?.alternative_image ||
          item?.product?.cover;

        const showDescription =
          item?.customizations?.show_custom_description === 'true' &&
          Boolean(item.description);

        return (
          <MultiOffers.Product
            key={item.uuid}
            uuid={item.uuid}
            title={offerTitle}
            image={offerImage}
            description={showDescription ? item.description : null}
            installments={item.payment?.installments ?? 1}
            price={item.totalPrice}
            paymentMethod={item.mainPaymentMethod}
            offerSelected={offerSelected}
            isOneClick={isOneClick}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
};

// eslint-disable-next-line react/display-name
MultiOffers.Product = function ({
  uuid,
  image,
  title,
  paymentMethod,
  description,
  price,
  installments,
  offerSelected,
  isOneClick,
  onSelect,
}) {
  const isSelected = offerSelected === uuid;

  const installmentValue =
    installments > 1 ? price / installments : price;

  return (
    <div
      className='wrapper-item-offer'
      onClick={() => onSelect(uuid)}
      {...(isSelected && { style: { borderColor: '#0f1b35' } })}
    >
      {isSelected && (
        <IoIosCheckmarkCircleOutline
          className='icon-offer-selected'
          size={20}
          {...(isOneClick && { style: { top: '8px' } })}
        />
      )}

      {!image && (
        <div className='image-offer-empty'>
          <IoImageOutline size={20} />
        </div>
      )}

      <div className='wrapper-info-offer'>
        <div className='wrapper-offer-title'>
          <h1 className='text-[0.85rem] min-[800px]:text-[1rem]'>
            {title}
          </h1>
          {description && <p>{description}</p>}
        </div>

        <div className='wrapper-offer-price'>
          {isOneClick && paymentMethod === 'credit_card' && (
            <div className='offer-price'>
              <span>
                {price.toLocaleString('pt-br', {
                  currency: 'BRL',
                  style: 'currency',
                })}
              </span>
            </div>
          )}

          {!isOneClick && paymentMethod === 'credit_card' && (
            <div className='wrapper-installment-offer-text'>
              <span className='installment-offer'>
                <span className='installment-amount'>
                  {installments}x
                </span>{' '}
                {installmentValue?.toLocaleString('pt-br', {
                  currency: 'BRL',
                  style: 'currency',
                })}
              </span>
              <span className='offer-total-price'>
                {price.toLocaleString('pt-br', {
                  currency: 'BRL',
                  style: 'currency',
                })}{' '}
                à vista
              </span>
            </div>
          )}

          {!isOneClick && paymentMethod === 'pix' && (
            <div className='total-price'>
              <span className='price'>
                {price.toLocaleString('pt-br', {
                  currency: 'BRL',
                  style: 'currency',
                })}{' '}
                à vista
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
