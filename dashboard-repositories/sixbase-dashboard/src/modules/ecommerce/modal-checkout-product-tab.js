import { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import CheckoutConfigTab from './modal-checkout-config';
import CheckoutPersonalizeTab from './modal-checkout-personalize';
import Loader from '../../utils/loader';

const CheckoutProductTab = ({ productUuid, product, setProduct }) => {
  const [activeSubTab, setActiveSubTab] = useState('configuracoes');

  if (!productUuid || !product) {
    return <Loader title='Carregando...' />;
  }

  return (
    <div>
      <Tabs
        activeKey={activeSubTab}
        onSelect={(k) => setActiveSubTab(k || 'configuracoes')}
        className='mb-3 nav-tabs-checkout-sub'
        variant='tabs'
      >
        <Tab
          eventKey='configuracoes'
          title={
            <div className='d-flex align-items-center'>
              <i className='bx bx-cog me-1' />
              <span>Configurações</span>
            </div>
          }
        >
          {activeSubTab === 'configuracoes' && (
            <CheckoutConfigTab
              productUuid={productUuid}
              product={product}
              setProduct={setProduct}
            />
          )}
        </Tab>

        <Tab
          eventKey='personalizar'
          title={
            <div className='d-flex align-items-center'>
              <i className='bx bx-paint-roll me-1' />
              <span>Personalizar</span>
            </div>
          }
        >
          {activeSubTab === 'personalizar' && (
            <CheckoutPersonalizeTab
              productUuid={productUuid}
              product={product}
              setProduct={setProduct}
            />
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default CheckoutProductTab;
