const express = require('express');

const router = express.Router();
const salesController = require('../controllers/sales');

router.get('/overall', salesController.findSalesPaginated);

router.get('/ip', salesController.findSalesIp);

router.get('/status', salesController.findStatus);

router.get('/export', salesController.exportSales);

router.get('/export-charges', salesController.exportCharges);

router.get('/card-approval', salesController.card_approval);

router.post('/refund/:uuid', salesController.refundSale);

router.get('/:saleItemUuid/refund-receipt', salesController.generateRefundReceipt);

router.get('/:saleItemUuid', salesController.findSingleSale);

module.exports = router;
