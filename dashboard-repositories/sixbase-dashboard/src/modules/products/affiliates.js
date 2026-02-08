import { useEffect, useState } from 'react';
import AffiliateContent from './AffiliateContent';
import { useParams } from 'react-router-dom';
import api from '../../providers/api';
import { useForm } from 'react-hook-form';
import { useProduct } from '../../providers/contextProduct';

const PageProductsEditAffiliates = () => {
  const { uuidProduct } = useParams();
  const [requesting, setRequesting] = useState(false);
  const [commission, setCommission] = useState(0);
  const [, setStatusMarket] = useState(null);
  const { product } = useProduct();

  const [allowAffiliate, setAllowAffiliate] = useState(false);
  const [allowSubscriptionFee, setAllowSubscriptionFee] = useState(false);

  const { register, reset, errors, control, handleSubmit } = useForm({
    mode: 'onChange',
  });

  const fetchAffiliateSettings = async () => {
    setRequesting(true);
    api
      .get('/products/affiliate/' + uuidProduct)
      .then((response) => {
        setCommission(response.data.commission);
        reset(response.data);
        setAllowAffiliate(response.data.allow_affiliate);
        setAllowSubscriptionFee(response.data.subscription_fee);
        setStatusMarket(response.data.status_market);
      })
      .catch(() => {});
    setRequesting(false);
  };

  useEffect(() => {
    fetchAffiliateSettings();
  }, []);

  return (
    <>
      <section id='affiliates'>
        <AffiliateContent
          product={product}
          uuidProduct={uuidProduct}
          fetchAffiliateSettings={fetchAffiliateSettings}
          requesting={requesting}
          setRequesting={setRequesting}
          commission={commission}
          setCommission={setCommission}
          allowAffiliate={allowAffiliate}
          setAllowAffiliate={setAllowAffiliate}
          allowSubscriptionFee={allowSubscriptionFee}
          setAllowSubscriptionFee={setAllowSubscriptionFee}
          control={control}
          errors={errors}
          register={register}
          handleSubmit={handleSubmit}
        />
      </section>
    </>
  );
};

export default PageProductsEditAffiliates;
