import { currency } from 'functions';
import { colorShade } from './functions';

const Plans = ({ checkout, plans, selectedPlan, setSelectedPlan }) => {
  return (
    <>
      <section id='plans'>
        {plans.length >= 2 ? (
          <div className='card-head'>Escolha seu plano de assinatura</div>
        ) : (
          <div className='card-head'>
            Plano de assinatura selecionado abaixo
          </div>
        )}
        <div className='plans-list'>
          {plans.map((item, index) => {
            return (
              <div
                className={selectedPlan === item ? 'plan active' : 'plan'}
                key={index}
                onClick={() => {
                  setSelectedPlan(item);
                }}
              >
                <div className='header'>{item.label}</div>
                {item.subscription_fee && (
                  <div
                    className='content'
                    style={
                      selectedPlan === item
                        ? { background: colorShade(checkout.hex_color, 30) }
                        : null
                    }
                  >
                    <div className='list-item'>
                      <span className='price-sub'>
                        {currency(item.subscription_fee_price)}
                      </span>
                      <span className='description-sub'>Adesão</span>
                    </div>
                  </div>
                )}
                <div
                  className={
                    item.subscription_fee
                      ? 'content-box-shadow mt-0'
                      : 'content mt-0'
                  }
                >
                  <div className='list-item'>
                    <span className='price'>{currency(item.price)}</span>
                    <span className='description'>{item.frequency}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

// eslint-disable-next-line react/display-name
Plans.ThreeSteps = function (props) {
  const { plans, selectedPlan, setSelectedPlan, offer } = props;

  const messageDiscout = {
    Anual: 'ano',
    Bimestral: 'Bimestre',
    Mensal: 'mês',
    Semestral: 'semestre',
    Trimestral: 'trimestre',
  };

  const findPlan = plans.find((plan) => plan.frequency === 'Mensal');

  if (!selectedPlan) return <></>;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
      }}
    >
      {plans.map((plan) => (
        <div
          key={plan.uuid}
          style={{
            width: '100%',
            borderRadius: '4px',
            border: '1px solid black',
            backgroundColor: 'white',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onClick={() => setSelectedPlan(plan)}
        >
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 16px 0px 16px',
                gap: '16px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {offer.offerShopify &&
                  offer.offerShopify.length > 0 &&
                  offer.offerShopify[0].image && (
                    <img
                      src={offer.offerShopify[0].image}
                      alt={offer.offerShopify[0].title}
                      style={{
                        width: '40px',
                        height: '40px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                      }}
                    />
                  )}
                <div>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      margin: '0px',
                    }}
                  >
                    {plan.label}
                  </h3>
                  {offer.offerShopify &&
                    offer.offerShopify.length > 0 &&
                    offer.offerShopify !==
                      'Não foi possível encontrar ofertas shopify' && (
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        {offer.offerShopify.map((item, index) => (
                          <div key={index} style={{ marginBottom: '4px' }}>
                            <div style={{ fontWeight: '500' }}>
                              {item.title}
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center',
                              }}
                            >
                              <span>Qtd: {item.quantity}</span>
                              <span style={{ fontWeight: '600' }}>
                                {currency(item.price)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  textDecoration:
                    !plan.charge_first && plan.subscription_fee_price
                      ? 'line-through'
                      : 'none',
                }}
              >
                {plan.price.toLocaleString('pt-br', {
                  currency: 'BRL',
                  style: 'currency',
                })}
              </span>
            </div>
            <div
              style={{
                width: '100%',
                padding: '8px 16px',
              }}
            >
              {plan.subscription_fee && (
                <p
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    margin: '0px',
                    width: 'fit-content',
                  }}
                >
                  <span
                    style={{
                      paddingRight: '4px',
                      fontWeight: '500',
                      width: 'fit-content',
                    }}
                  >
                    Taxa de Adesão:
                  </span>
                  {plan.subscription_fee_price.toLocaleString('pt-br', {
                    currency: 'BRL',
                    style: 'currency',
                  })}
                </p>
              )}
            </div>
          </div>
          {!plan.charge_first && plan.subscription_fee && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '3px 8px',
                backgroundColor: '#c7fed45c',
                fontWeight: '600',
                color: '#3b864dff',
              }}
            >
              <span style={{ display: 'block', fontSize: '0.75rem' }}>
                Desconto no primeiro {messageDiscout[plan.frequency]}
              </span>
              <span style={{ display: 'block', fontSize: '0.75rem' }}>
                {plan.price.toLocaleString('pt-br', {
                  currency: 'BRL',
                  style: 'currency',
                })}
              </span>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              alignItems: 'center',
              backgroundColor: '#d9d9d94c',
              borderTop: '1px solid #d9d9d9b1',
              padding: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                width: '100%',
                gap: '4px',
              }}
            >
              <input
                checked={selectedPlan.uuid === plan.uuid}
                style={{ display: 'block' }}
                type='checkbox'
              />

              {findPlan && (
                <Plans.DiscountMonth
                  frequency={plan.frequency}
                  planPrice={plan.price}
                  priceMonth={findPlan.price}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// eslint-disable-next-line react/display-name
Plans.DiscountMonth = function (props) {
  const { frequency, planPrice, priceMonth } = props;

  if (!priceMonth) return <></>;

  let monthAmount = 12;

  if (frequency === 'Bimestral') {
    monthAmount = 2;
  }

  if (frequency === 'Semestral') {
    monthAmount = 6;
  }

  if (frequency === 'Trimestral') {
    monthAmount = 3;
  }

  const economy = priceMonth * monthAmount - planPrice;
  const mounthPrice = planPrice / monthAmount;

  if (mounthPrice >= priceMonth || frequency === 'Mensal') return <></>;

  return (
    <>
      <span
        style={{
          display: 'block',
          fontSize: '0.75rem',
          color: '#1d801d',
          backgroundColor: '#7be37b84',
          borderRadius: '4px',
          padding: '0px 4px',
          whiteSpace: 'nowrap',
          fontWeight: '500',
        }}
      >
        Economize{' '}
        {economy.toLocaleString('pt-br', {
          currency: 'BRL',
          style: 'currency',
        })}
      </span>
      <div
        style={{
          display: 'flex',
          // width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          color: '#3F3F46',
          gap: '5px',
        }}
      >
        <p style={{ fontSize: '0.75rem', margin: '0px' }}>
          com cobrança mensal
        </p>
        <span
          className='block text-[0.85rem]'
          style={{
            display: 'block',
            fontSize: '0.75rem',
          }}
        >
          {mounthPrice.toLocaleString('pt-br', {
            currency: 'BRL',
            style: 'currency',
          })}
        </span>
      </div>
    </>
  );
};

export default Plans;
