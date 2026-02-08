const express = require('express');

const {
  getTransactionsController,
  cancelRefundWarrantyController,
} = require('../../controllers/membership/transactions');

const router = express.Router();

router.get('/', getTransactionsController);

router.post('/cancel-refund', cancelRefundWarrantyController);

module.exports = router;
