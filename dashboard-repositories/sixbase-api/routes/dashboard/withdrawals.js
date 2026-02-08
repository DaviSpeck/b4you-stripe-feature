const express = require('express');
const validateDto = require('../../middlewares/validate-dto');
const createWithdrawalDTO = require('../../dto/withdrawals/createWithdrawal');
const {
  createWithdrawalController,
  getWithdrawalController,
} = require('../../controllers/common/withdrawals');

const router = express.Router();

router.post('/', validateDto(createWithdrawalDTO), createWithdrawalController);

router.get('/', getWithdrawalController);

module.exports = router;
