const express = require('express');
const {
  cancelStudentSubscriptionController,
  getStudentSubscriptionsController,
  subscriptionCreditCardController,
} = require('../../controllers/membership/subscriptions');
const validateDto = require('../../middlewares/validate-dto');
const updateCreditCardDTO = require('../../dto/students/changeCreditCard');

const router = express.Router();

router.get('/', getStudentSubscriptionsController);

router.put(
  '/:subscription_uuid/card',
  validateDto(updateCreditCardDTO),
  subscriptionCreditCardController,
);

router.post('/:subscription_uuid/cancel', cancelStudentSubscriptionController);

module.exports = router;
