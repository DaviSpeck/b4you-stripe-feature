const express = require('express');
const SalesController = require('../../controllers/sales/sales');

const router = express.Router();

router.get('/:email', SalesController.getClientCode);

router.get('/code/:code', SalesController.verifyCode);

router.post(
  '/subscriptions/cancel/:id_student/:uuid_subscription',
  SalesController.cancelSubscription,
);

router.post('/subscriptions/card', SalesController.updateCard);

module.exports = router;
