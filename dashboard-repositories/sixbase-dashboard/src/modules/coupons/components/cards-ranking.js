import BronzeMedal from '../../../icons/medals/bronze.svg';
import GoldMedal from '../../../icons/medals/gold.svg';
import SilverMedal from '../../../icons/medals/silver.svg';
import CardCreator from './card';

const CardsRanking = ({ items, loading }) => {
  return (
    <>
      <h4 className='coupons-ranking-title'>Cupons em destaque</h4>

      <div className='card-list-ranking'>
        <CardCreator
          item={items[0]}
          color={'#EFC75E'}
          img={GoldMedal}
          loading={loading}
        />

        <CardCreator
          item={items[1]}
          color={'#BDBDBD'}
          img={SilverMedal}
          loading={loading}
        />

        <CardCreator
          item={items[2]}
          color={'#ED9D5D'}
          img={BronzeMedal}
          loading={loading}
        />
      </div>
    </>
  );
};

export default CardsRanking;
