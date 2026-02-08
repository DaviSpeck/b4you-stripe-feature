const express = require('express');
const session = require('../config/session');
const cors = require('../config/cors');
const { findFrenet } = require('../controllers/common');
const Frenet = require('../services/integrations/Frenet');
const FindOffer = require('../useCases/checkout/offers/FindOffer');
const { metricsProm } = require('../middlewares/prom');

const router = express.Router();
router.use(session);
router.use(metricsProm);

router.use('/sales', require('./sales'));
router.use('/event', require('./event'));
router.use('/events', require('./events'));

router.use(cors);
router.use('/cart', require('./cart'));
router.use('/ecommerce', require('./ecommerce'));
router.use('/offers', require('./offers'));
router.use('/delivery', require('./delivery'));
router.use('/renew', require('./renew'));
router.use('/upsell-native', require('./upsell-native'));
router.use(
  '/:affiliate',
  async (req, _res, next) => {
    req.affiliate = req.params.affiliate;
    return next();
  },
  require('./affiliates'),
);
router.use('/checkout-info', require('./checkout_info'));

router.post('/shippingOptions', async (req, res) => {
  const { body } = req;

  try {
    if (!body.cep && !body.offer_id) {
      return res.sendStatus(400);
    }
    const offer = await new FindOffer(body.offer_id).execute();
    if (!offer) return res.sendStatus(400);
    const { id_product, offer_product: product } = offer;
    let { dimensions } = product;
    const dimensonsOffer = offer?.dimensions?.[0] ?? {
      width: 0,
      height: 0,
      length: 0,
      weight: 0,
    };
    const isEmptyDimensions =
      !dimensions ||
      Object.values(dimensions).every((v) => v == null || v === 0);
    dimensions = isEmptyDimensions ? dimensonsOffer : dimensions;
    if (!dimensions || dimensions.length === 0 || dimensions === undefined) {
      return res.status(200).send([]);
    }
    const frenet = await findFrenet({
      id: id_product,
      id_user: product.id_user,
    });
    if (!frenet) return res.sendStatus(400);
    const shippingItemArray = [
      {
        Weight: dimensions.weight || 0,
        Height: dimensions.height || 0,
        Length: dimensions.length || 0,
        Width: dimensions.width || 0,
        Quantity: 1,
        SKU: offer?.bling_sku || '',
      },
    ];
    let value = offer.price;
    if (body.order_bumps.length > 0) {
      const { order_bumps } = offer;
      for (const order of body.order_bumps) {
        const selectedOb = order_bumps.find((ob) => ob.uuid === order);
        if (selectedOb && selectedOb.offer.offer_product.dimensions) {
          const { offer: obOffer } = selectedOb;
          const { offer_product: obProduct } = obOffer;
          value += obOffer.price;
          shippingItemArray.push({
            Weight: obProduct.dimensions.weight || 0,
            Height: obProduct.dimensions.height || 0,
            Length: obProduct.dimensions.length || 0,
            Width: obProduct.dimensions.width || 0,
            Quantity: 1,
            SKU: obOffer?.bling_sku || '',
          });
        }
      }
    }
    const options = await new Frenet(frenet.settings.token).getShippingQuote({
      RecipientCEP: body.cep,
      SellerCEP: frenet.settings.cep,
      ShipmentInvoiceValue: value,
      RecipientCountry: 'BR',
      ShippingItemArray: shippingItemArray,
    });
    const { ShippingSevicesArray } = options;

    const validShippingOptions = ShippingSevicesArray.filter((s) => !s.Error);

    let data = validShippingOptions.map((s) => ({
      label: `${s.ServiceDescription} - até ${s.DeliveryTime} dias úteis`,
      price: parseFloat(s.ShippingPrice),
      company: `${s.ServiceCode}_${s.ServiceDescription}_${s.CarrierCode}`,
    }));

    if (product.payment_type === 'subscription' && product.id_user === 123058) {
      data = validShippingOptions
        .filter((s) => s.ShippingPrice === '0.00')
        .map((s) => ({
          label: `${s.ServiceDescription} - até ${s.DeliveryTime} dias úteis`,
          price: 0,
          company: `${s.ServiceCode}_${s.ServiceDescription}_${s.CarrierCode}`,
        }));
    }
    return res.status(200).send(data);
  } catch (error) {
    // eslint-disable-next-line
    console.log(error);
    return res.status(200).send([]);
  }
});

router.post('/errors/log', async (req, res) => {
  const { body } = req;
  try {
    // eslint-disable-next-line no-console
    console.log('ERROR FRONTEND', JSON.stringify(body));
    return res.sendStatus(200);
  } catch (error) {
    // eslint-disable-next-line
    console.log(error);
    return res.status(200).send([]);
  }
});

module.exports = router;
