import { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import ModalPayment from './modal-payment';
import ModalShipping from './modal-shipping';
import ModalBumps from './modal-bumps';
import ModalUpsell from './modal-upsell';
import ModalOfferCheckoutExtras from './modal-offer-checkout-extras';
import ModalOfferAdditionalInfo from './modal-offer-additional-info';
import SupplierContent from './modal-parcerias-fornecedor';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';
import Loader from '../../utils/loader';

const ModalOfferConfig = ({ setShow, shop }) => {
  const [activeTab, setActiveTab] = useState('payment');
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
      setFullShop(shop);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader title='Carregando configurações da oferta...' />;
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
      <div className='alert alert-info mb-3'>
        <small>
          <i className='bx bx-info-circle me-1'></i>
          Configurações da <strong>Oferta Padrão</strong>. Estas configurações serão
          herdadas por todas as ofertas dinâmicas geradas a partir do carrinho.
        </small>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'payment')}
        className='mb-3 tabs-offer-new'
        variant='pills'
      >
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
          eventKey='bumps'
          title={
            <div className='d-flex align-items-center'>
              <i className='bx bx-plus-circle' />
              <span className='ml-2'>Order Bumps</span>
            </div>
          }
        >
          {activeTab === 'bumps' && (
            <ModalBumps setShow={() => {}} shop={shopToUse} embedded={true} />
          )}
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
          eventKey='checkout'
          title={
            <div className='d-flex align-items-center'>
              <i className='bx bx-cart' />
              <span className='ml-2'>Checkout</span>
            </div>
          }
        >
          {activeTab === 'checkout' && (
            <ModalOfferCheckoutExtras shop={shopToUse} embedded={true} />
          )}
        </Tab>

        <Tab
          eventKey='fornecedor'
          title={
            <div className='d-flex align-items-center'>
              <i className='bx bx-store-alt' />
              <span className='ml-2'>Fornecedor</span>
            </div>
          }
        >
          {activeTab === 'fornecedor' && shopToUse?.container_product?.uuid && (
            <SupplierContent productUuid={shopToUse.container_product.uuid} />
          )}
        </Tab>

        <Tab
          eventKey='additional-info'
          title={
            <div className='d-flex align-items-center'>
              <i className='bx bx-info-circle' />
              <span className='ml-2'>Info. Adicionais</span>
            </div>
          }
        >
          {activeTab === 'additional-info' && (
            <ModalOfferAdditionalInfo shop={shopToUse} embedded={true} />
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

export default ModalOfferConfig;
