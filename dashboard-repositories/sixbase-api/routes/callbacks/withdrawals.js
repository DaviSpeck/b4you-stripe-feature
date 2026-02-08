const express = require('express');
const {
  callbackWithdrawalController,
} = require('../../controllers/callbacks/withdrawals');

const router = express.Router();

router.post('/', callbackWithdrawalController);

module.exports = router;
