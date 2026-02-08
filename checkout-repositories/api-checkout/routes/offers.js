const express = require('express');

const router = express.Router();

const {
  findOfferController,
  getOfferInfoController,
  validateCouponController,
  createShopifyProductOffer,
} = require('../controllers/offers');

const {
  setAffiliateCookieController,
} = require('../controllers/product/product');

router.get('/info', getOfferInfoController);

router.get('/:offer_id', findOfferController);

router.get('/:offer_id/coupon/:coupon', validateCouponController);

router.get('/:offer_id/:affiliate_id', setAffiliateCookieController);

router.post('/offerByShopify', createShopifyProductOffer);

module.exports = router;
