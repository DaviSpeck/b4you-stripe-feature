const express = require('express');

const router = express.Router();
const {
  findSalesController,
  findSaleFiltersController,
  findSingleSaleController,
  studentAccessController,
  findSalesMetricsController,
  exportSalesController,
  exportSalesTrackingController,
  uploadSalesTrackingController,
  updateStudentDataController,
  findSalesOffersMetricsController,
  findCouponsOffersMetricsController,
  findGroupedSalesController,
  updateTrackingController,
} = require('../../controllers/common/sales');
const {
  createProducerRefundController,
  findSaleRefundController,
  generateRefundPDFController,
} = require('../../controllers/dashboard/refunds');
const refundDTO = require('../../dto/products/createRefund');
const validateDto = require('../../middlewares/validate-dto');

const updateStudentDataSchema = require('../../dto/sales/updateStudentData');
const updateTrackingDataSchema = require('../../dto/sales/updateTracking');

router.get('/', findSalesController);

router.get('/grouped/:id_sale_item', findGroupedSalesController);

router.get('/metrics', findSalesMetricsController);

router.get('/filters', findSaleFiltersController);

router.get('/filters/offers', findSalesOffersMetricsController);

router.get('/filters/coupons', findCouponsOffersMetricsController);

router.post('/export', exportSalesController);

router.post('/export/tracking', exportSalesTrackingController);

router.post('/export/tracking/upload', uploadSalesTrackingController);

router.get('/:sale_item_id', findSingleSaleController);

router.put(
  '/:sale_item_uuid',
  validateDto(updateStudentDataSchema),
  updateStudentDataController,
);

router.put(
  '/:sale_item_uuid/tracking',
  validateDto(updateTrackingDataSchema),
  updateTrackingController,
);

router.post(
  '/:sale_item_id/refund',
  validateDto(refundDTO),
  createProducerRefundController,
);

router.get('/:sale_item_id/refund', findSaleRefundController);

router.get('/:sale_item_id/refund-receipt', generateRefundPDFController);

router.get('/:sale_item_id/access', studentAccessController);

module.exports = router;
