import { useEffect, useState } from 'react';
import api from '../../providers/api';
import { notify } from '../functions';
import { useForm } from 'react-hook-form';
import MarketContent from '../products/MarketContent';
import Loader from '../../utils/loader';

const ModalVitrine = ({ setShow, shop, embedded = false }) => {
  const productUuid = shop?.container_product?.uuid;
  const [requesting, setRequesting] = useState(false);
  const [, setCommission] = useState(0);
  const [statusMarket, setStatusMarket] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setAllowAffiliate] = useState(false);
  const [, setAllowSubscriptionFee] = useState(false);

  const { register, reset, handleSubmit } = useForm({
    mode: 'onChange',
  });

  useEffect(() => {
    if (productUuid) {
      fetchProduct();
      fetchAffiliateSettings();
    } else {
      setLoading(false);
    }
  }, [productUuid]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/product/${productUuid}`);
      setProduct(response.data);
    } catch (err) {
      console.error('Erro ao carregar produto:', err);
      notify({ message: 'Falha ao carregar produto', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAffiliateSettings = async () => {
    if (!productUuid) {
      setLoading(false);
      return;
    }
    setRequesting(true);
    try {
      const response = await api.get('/products/affiliate/' + productUuid);
      setCommission(response.data.commission);
      reset(response.data);
      setAllowAffiliate(response.data.allow_affiliate);
      setAllowSubscriptionFee(response.data.subscription_fee);
      setStatusMarket(response.data.status_market);
    } catch (err) {
      console.error('Erro ao carregar configurações de vitrine:', err);
    } finally {
      setRequesting(false);
    }
  };

  const handleSubmitMarket = async () => {
    if (!productUuid) return;
    setRequesting(true);

    try {
      await api.put(`/products/affiliate/${productUuid}/market`, {
        list_on_market: true,
      });
      notify({
        message: 'Salvo com sucesso',
        type: 'success',
      });
      await fetchAffiliateSettings();
    } catch (error) {
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
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <Loader title='Carregando configurações de vitrine...' />;
  }

  if (!productUuid || !product) {
    return (
      <div className='text-center py-4'>
        <p className='text-muted'>Produto container não encontrado</p>
      </div>
    );
  }

  return (
    <div>
      <MarketContent
        product={product}
        uuidProduct={productUuid}
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

export default ModalVitrine;
