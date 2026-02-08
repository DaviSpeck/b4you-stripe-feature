import { useState } from 'react';
import 'react-credit-cards/es/styles-compiled.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import SalesInfoPix from 'SalesInfo/SalesInfoPix';
import SubscriptionRenovation from 'SubscriptionRenovation';
import Upsell from 'upsell/upsell';
import { UpsellNative } from 'upsell-native';

import Checkout from './Checkout';
import Checkout3Steps from './Checkout3Steps';
import Cookie from './cookie/';
import Delivery from './delivery/';
import { NotFoundPage } from 'notFound';

function App() {
  const [pixels, setPixels] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const subscriptionIdParam = urlParams.has('subscription_id');

  return (
    <Router>
      <Routes>
        {subscriptionIdParam && (
          <Route path='/' element={<SubscriptionRenovation />} />
        )}

        {!subscriptionIdParam && (
          <>
            <Route
              path='/upsell-native/:uuidOffer/:uuidSaleItem'
              element={<UpsellNative />}
            />

            <Route
              path='/upsell/:uuidSaleItem/:uuidOffer'
              element={<Upsell />}
            />

            <Route
              path='/sales/pix/info/:uuidSaleItem'
              element={<SalesInfoPix />}
            />

            <Route
              path='/compra-realizada/:uuidSale'
              element={<Delivery pixels={pixels} setPixels={setPixels} />}
            />

            <Route
              path='/cookie/:destination/:uuidOffer/:uuidAffiliate'
              element={<Cookie />}
            />

            <Route
              path='/carrinho/:uuidCart/:uuidOffer/:Checkout3Steps'
              element={
                <Checkout3Steps pixels={pixels} setPixels={setPixels} />
              }
            />

            <Route
              path='/carrinho/:uuidCart/:uuidOffer'
              element={<Checkout pixels={pixels} setPixels={setPixels} />}
            />

            <Route
              path='/:uuidOffer/:Checkout3Steps'
              element={
                <Checkout3Steps pixels={pixels} setPixels={setPixels} />
              }
            />

            <Route
              path='/:uuidOffer'
              element={<Checkout pixels={pixels} setPixels={setPixels} />}
            />

            <Route path='/notFound' element={<NotFoundPage />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;