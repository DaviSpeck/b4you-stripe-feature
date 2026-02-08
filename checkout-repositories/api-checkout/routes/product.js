const express = require('express');

const router = express.Router();

const productController = require('../controllers/product/product');

router.get(
  '/:redirect/:offer_id/:affiliate_id',
  productController.redirectController,
);
router.get(
  '/:redirect/:offer_id/:affiliate_id/:cart_id',
  productController.redirectController,
);

module.exports = router;
