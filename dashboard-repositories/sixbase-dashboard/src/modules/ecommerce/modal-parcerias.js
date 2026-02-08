import { useEffect, useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import api from '../../providers/api';
import { useForm } from 'react-hook-form';
import Loader from '../../utils/loader';
import AffiliateContent from '../products/AffiliateContent';
import CoproductionContent from './modal-parcerias-coproducao';
import ManagerContent from './modal-parcerias-gerentes';
import SupplierContent from './modal-parcerias-fornecedor';

const ModalParcerias = ({ setShow, shop, embedded = false }) => {
  const productUuid = shop?.container_product?.uuid;
  const [activeSubTab, setActiveSubTab] = useState('afiliados');
  const [requesting, setRequesting] = useState(false);
  const [commission, setCommission] = useState(0);
  const [, setStatusMarket] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowAffiliate, setAllowAffiliate] = useState(false);
  const [allowSubscriptionFee, setAllowSubscriptionFee] = useState(false);

  const { register, reset, errors, control, handleSubmit, setValue } = useForm({
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
    } finally {
      setLoading(false);
    }
  };

  const fetchAffiliateSettings = async () => {
    if (!productUuid) return;
    setRequesting(true);
    try {
      const response = await api.get('/products/affiliate/' + productUuid);
      setCommission(response.data.commission);
      reset(response.data);
      setAllowAffiliate(response.data.allow_affiliate);
      setAllowSubscriptionFee(response.data.subscription_fee);
      setStatusMarket(response.data.status_market);
    } catch (err) {
      console.error('Erro ao carregar configurações de parcerias:', err);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <Loader title='Carregando configurações de parcerias...' />;
  }

  if (!productUuid || !product) {
    return (
      <div className='text-center py-4'>
        <p className='text-muted'>Produto container não encontrado</p>
      </div>
    );
  }

  return (
    <Tabs
      activeKey={activeSubTab}
      onSelect={(k) => setActiveSubTab(k || 'afiliados')}
      className='mb-3'
      variant='pills'
    >
      <Tab eventKey='afiliados' title='Afiliados'>
        <section id='affiliates'>
          <AffiliateContent
            product={product}
            uuidProduct={productUuid}
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
            setValue={setValue}
          />
        </section>
      </Tab>
      <Tab eventKey='coproducao' title='Coprodução'>
        <CoproductionContent productUuid={productUuid} product={product} />
      </Tab>
      <Tab eventKey='gerentes' title='Gerentes'>
        <ManagerContent productUuid={productUuid} />
      </Tab>
      <Tab eventKey='fornecedor' title='Fornecedor'>
        <SupplierContent productUuid={productUuid} />
      </Tab>
    </Tabs>
  );
};

export default ModalParcerias;
