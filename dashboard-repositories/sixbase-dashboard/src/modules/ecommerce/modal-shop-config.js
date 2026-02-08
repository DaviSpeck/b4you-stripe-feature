import { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import ModalBumps from './modal-bumps';
import ModalUpsell from './modal-upsell';
import ModalPayment from './modal-payment';
import ModalShipping from './modal-shipping';
import ModalGeneral from './modal-general';
import ModalVitrine from './modal-vitrine';
import ModalParcerias from './modal-parcerias';
import ModalRastreio from './modal-rastreio';
import ModalCupons from './modal-cupons';
import ModalCheckout from './modal-checkout';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';
import Loader from '../../utils/loader';

const ModalShopConfig = ({ setShow, shop }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [fullShop, setFullShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shop?.uuid) {
      fetchFullShop();
    }
  }, [shop?.uuid]);

  const fetchFullShop = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/integrations/ecommerce/shops/${shop.uuid}`);
      setFullShop(response.data);
    } catch (err) {
      console.error('Erro ao carregar loja completa:', err);
      // Se falhar, usar o shop original
      setFullShop(shop);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader title='Carregando configurações da loja...' />;
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
    <div>
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
              <i className='bx bx-cart' />
              <span className='ml-2'>Checkout</span>
            </div>
          }
        >
          {activeTab === 'checkout' && (
            <ModalCheckout setShow={() => {}} shop={shopToUse} embedded={true} />
          )}
        </Tab>

        <Tab
          eventKey='payment'
          title={
            <div className='d-flex align-items-center'>
              <i className='bx bx-credit-card' />
              <span className='ml-2'>Pagamento</span>
            </div>
          }
        >
          {activeTab === 'payment' && (
            <ModalPayment setShow={() => {}} shop={shopToUse} embedded={true} />
          )}
        </Tab>

        <Tab
          eventKey='shipping'
          title={
            <div className='d-flex align-items-center'>
              <i className='bx bx-package' />
              <span className='ml-2'>Frete</span>
            </div>
          }
        >
          {activeTab === 'shipping' && (
            <ModalShipping setShow={() => {}} shop={shopToUse} embedded={true} />
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
            <ModalCupons setShow={() => {}} shop={shopToUse} embedded={true} />
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
            <ModalVitrine setShow={() => {}} shop={shop} embedded={true} />
          )}
        </Tab>

        <Tab
          eventKey='bumps'
          title={
            <div className='d-flex align-items-center'>
              <i className='bx bx-plus-circle' />
              <span className='ml-2'>Order Bumps</span>
            </div>
          }
        >
          <ModalBumps setShow={() => {}} shop={shop} embedded={true} />
        </Tab>

        <Tab
          eventKey='upsell'
          title={
            <div className='d-flex align-items-center'>
              <i className='bx bx-trending-up' />
              <span className='ml-2'>Upsell</span>
            </div>
          }
        >
          {activeTab === 'upsell' && (
            <ModalUpsell setShow={() => {}} shop={shopToUse} embedded={true} />
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
  );
};

export default ModalShopConfig;
