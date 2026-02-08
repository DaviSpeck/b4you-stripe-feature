const express = require('express');

const router = express.Router();
const balanceController = require('../../controllers/app/balance');

const {
  findUserBalanceController,
} = require('../../controllers/common/balance');

router.use('/transactions', require('./transactions'));

router.get('/', findUserBalanceController);

router.get('/total', balanceController.getTotal);

module.exports = router;
