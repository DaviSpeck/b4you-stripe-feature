const express = require('express');
const {
  findCheckoutAnalyticsByPeriod,
  getPaymentMethodAnalytics,
  getStatusAnalytics,
  getRegionAnalytics,
  getStateAnalytics,
  getSellerAnalytics,
  getProductAnalytics,
  getProductSearchAnalytics,
  getOriginAnalytics,
  getCalculationsAnalytics,
} = require('../controllers/checkoutAnalytics.js');
const {
  getJourneySummary,
  getJourneyFunnel,
  getJourneySteps,
  getJourneyPaymentMethods,
  getJourneyDistribution,
  getJourneyBreakdowns,
  getJourneyProducts,
  getJourneyProducers,
  getJourneySessions,
  getJourneyDomains,
} = require('../controllers/checkoutAnalyticsJourney');

const router = express.Router();

router.post('/analytics/payment-method', getPaymentMethodAnalytics);
router.post('/analytics/status', getStatusAnalytics);
router.post('/analytics/region', getRegionAnalytics);
router.post('/analytics/state', getStateAnalytics);
router.post('/analytics/seller', getSellerAnalytics);
router.post('/analytics/product', getProductAnalytics);
router.post('/analytics/product-search', getProductSearchAnalytics);
router.post('/analytics/origin', getOriginAnalytics);
router.post('/analytics/calculations', getCalculationsAnalytics);
router.post('/analytics/journey/summary', getJourneySummary);
router.post('/analytics/journey/funnel', getJourneyFunnel);
router.post('/analytics/journey/steps', getJourneySteps);
router.post('/analytics/journey/payment-methods', getJourneyPaymentMethods);
router.post('/analytics/journey/distribution', getJourneyDistribution);
router.post('/analytics/journey/breakdowns', getJourneyBreakdowns);
router.post('/analytics/journey/products', getJourneyProducts);
router.post('/analytics/journey/producers', getJourneyProducers);
router.post('/analytics/journey/sessions', getJourneySessions);
router.post('/analytics/journey/domains', getJourneyDomains);

module.exports = router;
