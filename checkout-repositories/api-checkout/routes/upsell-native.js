const express = require('express');
const {
  getUpsellNativeDataController,
  getUpsellNativePaymentDataByOfferController,
  getMultiOffersController,
  getUpsellNativePaymentDataPixByOfferController,
} = require('../controllers/checkout/upsell-native');
const {
  UserDataMiddleware,
} = require('../useCases/checkout/upsellNative/middleware');

const router = express.Router();

router.get('/:offer_uuid', UserDataMiddleware, getUpsellNativeDataController);

router.get(
  '/:offer_uuid/multi-offers',
  UserDataMiddleware,
  getMultiOffersController,
);

router.post(
  '/:offer_uuid/payment',
  UserDataMiddleware,
  getUpsellNativePaymentDataByOfferController,
);

router.post(
  '/:offer_uuid/payment/pix',
  UserDataMiddleware,
  getUpsellNativePaymentDataPixByOfferController,
);

module.exports = router;
