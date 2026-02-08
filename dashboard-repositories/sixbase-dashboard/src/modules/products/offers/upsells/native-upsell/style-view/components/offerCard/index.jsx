import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import { IoImageOutline } from 'react-icons/io5';
import './style.scss';

export const OfferCard = (params) => {
  // const { isSelected, name, price, installments, description } = props;

  const {
    isSelected,
    alternative_name,
    name,
    description,
    checkout_customizations,
    offer_product,
    payment_data,
  } = params;

  // eslint-disable-next-line no-extra-boolean-cast
  const offerTitle = Boolean(alternative_name) ? alternative_name : name;

  // eslint-disable-next-line no-extra-boolean-cast
  const offerImage = Boolean(checkout_customizations?.alternative_image)
    ? checkout_customizations.alternative_image
    : offer_product?.cover ?? null;

  const showDescription =
    checkout_customizations?.show_custom_description === 'true' &&
    Boolean(description);

  if (!payment_data) return <></>;

  return (
    <div
      className='wrapper-card-offer-upsell'
      {...(isSelected && { style: { borderColor: '#0f1b35' } })}
    >
      {isSelected && (
        <IoIosCheckmarkCircleOutline className='check-color' size={20} />
      )}
      {!offerImage && (
        <div className='wrapper-img-empty-offer-card'>
          <IoImageOutline size={20} style={{ display: 'block' }} />
        </div>
      )}
      <div className='wrapper-offer-upsell-text' style={{ width: '100%' }}>
        <div className='offer-upsell-text-header'>
          <h1>{offerTitle}</h1>
          {Boolean(showDescription) && <p>{description}</p>}
        </div>
        <div className='offer-upsell-text'>
          <div className='wrapper-prices-offer-upsell'>
            <span className='price-installment'>
              <span style={{ fontWeight: '400', fontSize: '0.775rem' }}>
                {payment_data?.maxInstallment.parcel}x R$
              </span>{' '}
              {payment_data?.maxInstallment.value.toLocaleString('pt-br', {
                currency: 'BRL',
                style: 'currency',
              })}
            </span>
            {payment_data?.maxInstallment.parcel > 1 && (
              <span className='wrapper-prices-offer-upsell-total'>
                {payment_data.originalPrice?.toLocaleString('pt-br', {
                  currency: 'BRL',
                  style: 'currency',
                })}{' '}
                <span>á vista</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// eslint-disable-next-line react/display-name
OfferCard.Plan = function (props) {
  const {
    isSelected,
    label = 'Plano Gold',
    price = 59.9,
    frequency = 'mensal',
    charge_first = false,
    subscription_fee = false,
    subscription_fee_price = 0,
  } = props;

  const frequencyLabel = {
    mensal: 'mensalmente',
    bimestral: 'bimestralmente',
    trimestral: 'trimestralmente',
    semestral: 'semestralmente',
    anual: 'anualmente',
  };

  return (
    <div
      className='wrapper-card-offer-upsell plan'
      {...(isSelected && { style: { borderColor: '#0f1b35' } })}
    >
      <div className='wrapper-card-headder-plan'>
        <h1>{label}</h1>
        <div className='wrapper-price'>
          <span>
            {price.toLocaleString('pt-br', {
              currency: 'BRL',
              style: 'currency',
            })}
          </span>
          {isSelected && (
            <IoIosCheckmarkCircleOutline
              style={{ display: 'block', color: 'green' }}
              size={20}
            />
          )}
        </div>
      </div>
      <div className='wrapper-plan-description'>
        <span className='frequency'>Plano {frequencyLabel[frequency]}</span>
        {subscription_fee && charge_first && (
          <span className='subscription-fee'>
            Taxa de adesão{' '}
            {subscription_fee_price.toLocaleString('pt-br', {
              currency: 'BRL',
              style: 'currency',
            })}
          </span>
        )}
      </div>
    </div>
  );
};
