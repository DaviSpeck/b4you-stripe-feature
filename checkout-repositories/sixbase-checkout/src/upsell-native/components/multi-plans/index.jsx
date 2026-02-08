import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import './style.scss';

export const MultiPlans = ({ plans, planSelectUuid, onSelect }) => {
  if (!Array.isArray(plans) || plans.length === 0) return null;

  return (
    <div className='multi-plans'>
      {plans.map((item) => (
        <MultiPlans.PlanItem
          key={item.uuid}
          {...item}
          planSelectUuid={planSelectUuid}
          onSelectPlan={onSelect}
        />
      ))}
    </div>
  );
};

// eslint-disable-next-line react/display-name
MultiPlans.PlanItem = function ({
  uuid,
  label,
  frequency_label,
  price,
  subscription_fee,
  subscription_fee_price,
  planSelectUuid,
  onSelectPlan,
}) {
  const isSelected = planSelectUuid === uuid;

  const frequencyDictionary = {
    mensal: 'mensalmente',
    bimestral: 'bimestralmente',
    trimestral: 'trimestralmente',
    semestral: 'semestralmente',
    anual: 'anualmente',
  };

  return (
    <div
      className={`multi-plans__item${isSelected ? ' is-selected' : ''}`}
      onClick={() => onSelectPlan(uuid)}
    >
      {isSelected && (
        <IoIosCheckmarkCircleOutline
          className='multi-plans__check'
          size={20}
        />
      )}

      <div className='multi-plans__content'>
        <div className='multi-plans__details'>
          <h1>
            {label}
          </h1>

          <p className='multi-plans__frequency'>
            Cobrado {frequencyDictionary[frequency_label]}
          </p>

          {subscription_fee && (
            <p className='multi-plans__subscription'>
              <span>Taxa de Adesão:</span>
              {subscription_fee_price.toLocaleString('pt-br', {
                currency: 'BRL',
                style: 'currency',
              })}
            </p>
          )}
        </div>

        <div className='multi-plans__price'>
          {price.toLocaleString('pt-br', {
            currency: 'BRL',
            style: 'currency',
          })}
        </div>
      </div>
    </div>
  );
};
