import { useEffect, useState } from 'react';
import api from '../../providers/api';
import { notify } from '../functions';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { useForm } from 'react-hook-form';
import { useProduct } from '../../providers/contextProduct';
import MarketContent from './MarketContent';

const ProductMarket = () => {
  const { uuidProduct } = useParams();
  const [requesting, setRequesting] = useState(false);
  const [, setCommission] = useState(0);

  const [statusMarket, setStatusMarket] = useState(null);
  const { product } = useProduct();

  const [, setAllowAffiliate] = useState(false);
  const [, setAllowSubscriptionFee] = useState(false);

  const { register, reset, handleSubmit } = useForm({
    mode: 'onChange',
  });

  useEffect(() => {
    fetchAffiliateSettings();
  }, []);

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

  const handleSubmitMarket = async () => {
    setRequesting(true);

    api
      .put(`/products/affiliate/${uuidProduct}/market`, {
        list_on_market: true,
      })
      .then(async () => {
        notify({
          message: 'Salvo com sucesso',
          type: 'success',
        });
        await fetchAffiliateSettings();
      })
      .catch((error) => {
        if (error?.response?.data?.message) {
          notify({
            message: error.response.data.message,
            type: 'error',
          });
        } else {
          notify({
            message: 'Erro ao salvar',
            type: 'error',
          });
        }

        setRequesting(false);
      });
  };

  return (
    <div>
      <MarketContent
        product={product}
        uuidProduct={uuidProduct}
        handleSubmitMarket={handleSubmitMarket}
        statusMarket={statusMarket}
        register={register}
        handleSubmit={handleSubmit}
        requesting={requesting}
        setRequesting={setRequesting}
      />
    </div>
  );
};

export default ProductMarket;
