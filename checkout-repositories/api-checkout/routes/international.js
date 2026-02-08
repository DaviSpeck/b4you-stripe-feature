const express = require('express');

const validateDTO = require('../middlewares/validate-dto');
const stripeFeatureFlag = require('../middlewares/stripe-feature-flag');
const createStripePaymentIntentDTO = require('../dto/international/createStripePaymentIntent');
const {
  createStripePaymentIntentController,
} = require('../controllers/checkout/international');

const router = express.Router();

router.post(
  '/payments/stripe/payment-intents',
  validateDTO(createStripePaymentIntentDTO),
  stripeFeatureFlag,
  createStripePaymentIntentController,
);

module.exports = router;
