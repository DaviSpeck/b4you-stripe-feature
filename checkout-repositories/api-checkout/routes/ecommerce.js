const express = require('express');
const {
  resolveOfferByCart,
  getShopConfig,
} = require('../controllers/checkout/ecommerce');

const router = express.Router();

router.post('/resolve-offer', resolveOfferByCart);
router.get('/config', getShopConfig);

module.exports = router;
