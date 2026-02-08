import { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import Loader from '../../utils/loader';
import api from '../../providers/api';
import ProductProvider from '../../providers/contextProduct';
import CheckoutConfigTab from './modal-checkout-config';
import CheckoutPersonalizeTab from './modal-checkout-personalize';

const ModalCheckout = ({ setShow, shop, embedded = false }) => {
  const productUuid = shop?.container_product?.uuid;
  const [activeSubTab, setActiveSubTab] = useState('configuracoes');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productUuid) {
      fetchProduct();
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

  if (loading) {
    return <Loader title='Carregando configurações de checkout...' />;
  }

  if (!productUuid || !product) {
    return (
      <div className='text-center py-4'>
        <p className='text-muted'>Produto container não encontrado</p>
      </div>
    );
  }

  return (
    <ProductProvider value={{ product, setProduct }}>
      <Tabs
        activeKey={activeSubTab}
        onSelect={(k) => setActiveSubTab(k || 'configuracoes')}
        className='mb-3'
        variant='pills'
      >
        <Tab eventKey='configuracoes' title='Configurações'>
          <CheckoutConfigTab 
            productUuid={productUuid} 
            product={product}
            setProduct={setProduct}
          />
        </Tab>
        <Tab eventKey='personalizar' title='Personalizar'>
          <CheckoutPersonalizeTab 
            productUuid={productUuid}
            product={product}
            setProduct={setProduct}
          />
        </Tab>
      </Tabs>
    </ProductProvider>
  );
};

export default ModalCheckout;
