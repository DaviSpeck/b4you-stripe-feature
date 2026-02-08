const express = require('express');
const {
  getSaleItemRefundController,
  saleItemRefundController,
  getRefundCode,
  getRefundData,
  cancelRefund,
} = require('../../controllers/refunds/student');
const validateDto = require('../../middlewares/validate-dto');
const refundDto = require('../../dto/sales/refundSaleItem');
const refundEmailCodeDto = require('../../dto/sales/refundEmailCode');
const refundInfoDto = require('../../dto/sales/refundInfo');

const router = express.Router();

router.get('/:uuid_sale_item', getSaleItemRefundController);

router.post('/code', validateDto(refundEmailCodeDto), getRefundCode);

router.post('/details', validateDto(refundInfoDto), getRefundData);

router.post(
  '/:uuid_sale_item',
  validateDto(refundDto),
  saleItemRefundController,
);

router.post('/cancel/:uuid_sale_item', cancelRefund);

module.exports = router;
