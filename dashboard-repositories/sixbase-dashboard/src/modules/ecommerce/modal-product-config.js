import { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import ModalGeneral from './modal-general';
import ModalParcerias from './modal-parcerias';
import ModalRastreio from './modal-rastreio';
import ModalVitrine from './modal-vitrine';
import ModalCupons from './modal-cupons';
import CheckoutProductTab from './modal-checkout-product-tab';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import ProductProvider from '../../providers/contextProduct';
import api from '../../providers/api';
import Loader from '../../utils/loader';

const ModalProductConfig = ({ setShow, shop }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [fullShop, setFullShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);

  const productUuid = shop?.container_product?.uuid;

  useEffect(() => {
    if (shop?.uuid) {
      fetchFullShop();
    }
  }, [shop?.uuid]);

  useEffect(() => {
    if (productUuid) {
      fetchProduct();
    }
  }, [productUuid]);

  const fetchFullShop = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/integrations/ecommerce/shops/${shop.uuid}`);
      setFullShop(response.data);
    } catch (err) {
      console.error('Erro ao carregar loja completa:', err);
      setFullShop(shop);
    } finally {
      setLoading(false);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/product/${productUuid}`);
      setProduct(response.data);
    } catch (err) {
      console.error('Erro ao carregar produto:', err);
    }
  };

  if (loading) {
    return <Loader title='Carregando configurações do produto...' />;
  }

  const shopToUse = fullShop || shop;

  if (!shopToUse || !shopToUse.uuid) {
    return (
      <div className='text-center py-4'>
        <p className='text-muted'>Loja não encontrada</p>
        {setShow && (
          <ButtonDS variant='outline-secondary' onClick={() => setShow(false)}>
            Fechar
          </ButtonDS>
        )}
      </div>
    );
  }

  return (
    <ProductProvider value={{ product, setProduct }}>
      <div>
        <div className='alert alert-info mb-3'>
          <small>
            <i className='bx bx-info-circle me-1'></i>
            Configurações do <strong>Produto Container</strong>. Estas configurações são compartilhadas por todas as ofertas da loja.
          </small>
        </div>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'general')}
          className='mb-3 tabs-offer-new'
          variant='pills'
        >
          <Tab
            eventKey='general'
            title={
              <div className='d-flex align-items-center'>
                <i className='bx bx-cog' />
                <span className='ml-2'>Geral</span>
              </div>
            }
          >
            {activeTab === 'general' && (
              <ModalGeneral setShow={() => {}} shop={shopToUse} embedded={true} />
            )}
          </Tab>

          <Tab
            eventKey='checkout'
            title={
              <div className='d-flex align-items-center'>
                <i className='bx bx-credit-card' />
                <span className='ml-2'>Checkout</span>
              </div>
            }
          >
            {activeTab === 'checkout' && (
              <CheckoutProductTab
                productUuid={productUuid}
                product={product}
                setProduct={setProduct}
              />
            )}
          </Tab>

          <Tab
            eventKey='vitrine'
            title={
              <div className='d-flex align-items-center'>
                <i className='bx bx-store' />
                <span className='ml-2'>Vitrine</span>
              </div>
            }
          >
            {activeTab === 'vitrine' && (
              <ModalVitrine setShow={() => {}} shop={shopToUse} embedded={true} />
            )}
          </Tab>

          <Tab
            eventKey='cupons'
            title={
              <div className='d-flex align-items-center'>
                <i className='bx bxs-coupon' />
                <span className='ml-2'>Cupons</span>
              </div>
            }
          >
            {activeTab === 'cupons' && (
              <ModalCupons setShow={() => {}} shop={shopToUse} embedded={true} isEcommerce={true} />
            )}
          </Tab>

          <Tab
            eventKey='parcerias'
            title={
              <div className='d-flex align-items-center'>
                <i className='bx bx-group' />
                <span className='ml-2'>Parcerias</span>
              </div>
            }
          >
            {activeTab === 'parcerias' && (
              <ModalParcerias setShow={() => {}} shop={shopToUse} embedded={true} />
            )}
          </Tab>

          <Tab
            eventKey='rastreio'
            title={
              <div className='d-flex align-items-center'>
                <i className='bx bx-map' />
                <span className='ml-2'>Rastreio</span>
              </div>
            }
          >
            {activeTab === 'rastreio' && (
              <ModalRastreio setShow={() => {}} shop={shopToUse} embedded={true} />
            )}
          </Tab>
        </Tabs>

        <div className='d-flex justify-content-end mt-4 border-top pt-3'>
          <ButtonDS variant='outline-secondary' onClick={() => setShow && setShow(false)}>
            Fechar
          </ButtonDS>
        </div>
      </div>
    </ProductProvider>
  );
};

export default ModalProductConfig;
