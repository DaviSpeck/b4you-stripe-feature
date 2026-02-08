const express = require('express');
const validateDTO = require('../../middlewares/validate-dto');
const validateCancelSubscriptionDTO = require('../../dto/subscriptions/cancelSubscription');
const {
  cancelSubscriptionController,
  findSubscriptionChargesPaginatedController,
  findSubscriptionPageFiltersController,
  findSubscriptionsMetricsController,
  findSubscriptionsPaginatedController,
  exportController,
  sendCardUpdateLinkController,
  reprocessChargeController,
} = require('../../controllers/dashboard/subscriptions');
const {
  findSelectedSubscriptionAdapter,
} = require('../../middlewares/validatorsAndAdapters/subscriptions');

const router = express.Router();

router.get('/', findSubscriptionsPaginatedController);

router.get('/filters', findSubscriptionPageFiltersController);

router.get('/metrics', findSubscriptionsMetricsController);

router.get('/export/data', exportController);

router.get('/:subscription_uuid', findSubscriptionChargesPaginatedController);

router.put(
  '/:subscription_id/cancel',
  validateDTO(validateCancelSubscriptionDTO),
  findSelectedSubscriptionAdapter,
  cancelSubscriptionController,
);

router.post(
  '/:subscription_id/send-card-update-link',
  findSelectedSubscriptionAdapter,
  sendCardUpdateLinkController,
);

router.post(
  '/:subscription_id/reprocess-charge',
  findSelectedSubscriptionAdapter,
  reprocessChargeController,
);

module.exports = router;
