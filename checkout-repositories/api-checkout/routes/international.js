const express = require('express');

const validateDTO = require('../middlewares/validate-dto');
const stripeFeatureFlag = require('../middlewares/stripe-feature-flag');
const createStripePaymentIntentDTO = require('../dto/international/createStripePaymentIntent');
const {
  createStripePaymentIntentController,
  stripeWebhookController,
} = require('../controllers/checkout/international');

const router = express.Router();

router.post(
  '/payments/stripe/payment-intents',
  validateDTO(createStripePaymentIntentDTO),
  stripeFeatureFlag,
  createStripePaymentIntentController,
);

router.post(
  '/payments/stripe/webhook',
  stripeFeatureFlag,
  stripeWebhookController,
);

module.exports = router;
