const express = require('express');
const {
  getMetricsByConversionController,
  getMetricsByPaymentMethodsController,
  getMetricsByStatusController,
  getMetricsChartController,
  getProductsMetricsController,
  verifyUserSalesController,
  salesV2,
  chartMetricsV2,
  metricsByStatusV2,
  findTotalReward,
} = require('../../controllers/dashboard/metrics');

const router = express.Router();

router.get('/payment-methods', getMetricsByPaymentMethodsController);

router.get('/status', getMetricsByStatusController);

router.get('/conversion', getMetricsByConversionController);

router.get('/chart', getMetricsChartController);

router.get('/products', getProductsMetricsController);

router.get('/', verifyUserSalesController);

router.get('/v2/sales', salesV2);

router.get('/v2/chart', chartMetricsV2);

router.get('/v2/status', metricsByStatusV2);

router.get('/reward', findTotalReward);

module.exports = router;
