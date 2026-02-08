const express = require('express');
const {
  findTransactionsController,
  getPageFilterController,
  findTransactionsRefundController,
  getTransactionDetails,
  generateStatementController,
  getStatementListController,
} = require('../../controllers/dashboard/transactions');

const router = express.Router();

router.get('/', findTransactionsController);

router.get('/details/:uuid', getTransactionDetails);

router.get('/refund/:uuid', findTransactionsRefundController);

router.get('/filters', getPageFilterController);

router.get('/statement', generateStatementController);

router.get('/statement/list', getStatementListController);

module.exports = router;
