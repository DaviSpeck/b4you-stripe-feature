const express = require('express');
const validateDto = require('../middlewares/validate-dto');
const CheckoutInfo = require('../dto/checkout-info');
const {
  createCheckoutInfoController,
  findCheckoutInfoController,
  updateCheckoutInfoController,
} = require('../controllers/checkout-info');

const router = express.Router();

router.post('/', validateDto(CheckoutInfo), createCheckoutInfoController);

router.get('/:uuid', findCheckoutInfoController);

router.put('/:uuid', validateDto(CheckoutInfo), updateCheckoutInfoController);

module.exports = router;
