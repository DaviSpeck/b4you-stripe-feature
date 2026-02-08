import { useEffect, useState } from 'react';
import CardNew from './card-new';
import CardTokenized from './card-tokenized';
import PropTypes from 'prop-types';

const MethodCard = ({
  card,
  uuidSaleItem,
  uuidOffer,
  redirectParent,
  price,
  isSubscription,
}) => {
  const [nav, setNav] = useState('tokenized');

  const handleChangeCardView = (newView) => {
    if (newView === nav) {
      return false;
    } else {
      setNav(newView);
    }
  };

  useEffect(() => {
    if (card) {
      if (card.lastFourDigits) return setNav('tokenized');

      return setNav('new');
    }

    return () => {
      setNav('tokenized');
    };
  }, [card]);

  return (
    <>
      <section id='card'>
        <div
          className='container-tokenized'
          onClick={() => {
            handleChangeCardView('tokenized');
          }}
        >
          {card && card.lastFourDigits && (
            <CardTokenized
              active={nav === 'tokenized'}
              card={card}
              uuidSaleItem={uuidSaleItem}
              uuidOffer={uuidOffer}
              redirectParent={redirectParent}
              price={price}
              isSubscription={isSubscription}
            />
          )}
        </div>
        <div
          className='container-new'
          onClick={() => {
            handleChangeCardView('new');
          }}
        >
          <CardNew
            active={nav === 'new'}
            card={card}
            uuidSaleItem={uuidSaleItem}
            uuidOffer={uuidOffer}
            redirectParent={redirectParent}
            price={price}
            isSubscription={isSubscription}
          />
        </div>
      </section>
    </>
  );
};

MethodCard.propTypes = {
  card: PropTypes.object,
  uuidSaleItem: PropTypes.string,
  uuidOffer: PropTypes.string,
  redirectParent: PropTypes.func,
  price: PropTypes.number,
  isSubscription: PropTypes.bool,
};

export default MethodCard;
