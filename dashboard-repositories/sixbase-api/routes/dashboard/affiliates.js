const express = require('express');
const validateDto = require('../../middlewares/validate-dto');
const {
  affiliateAllowAccess,
  affiliateActiveInvite,
  affiliateBlockInvite,
  affiliateSetCommission,
  affiliateRejectInvite,
  getAffiliateInfo,
} = require('../../middlewares/validatorsAndAdapters/affiliate_settings');
const {
  getAffiliatesController,
  getPendingAffiliatesController,
  setAffiliateActiveController,
  setAffiliateBlockController,
  setAffiliateCommissionController,
  getFiltersController,
  setAffiliateRejectController,
  setAffiliateAllowAccessController,
  exportAffiliates,
  getAffiliateRankingController,
  getAffiliateProductsController,
  getExportAffiliateRanking,
  getBestSallersAffiliateRanking,
  getPendingCount,
  updatePendingStatus,
  exportAffiliatesPeading,
  exportAffiliatesEmailController,
} = require('../../controllers/dashboard/affiliates');
const commissionDto = require('../../dto/affiliates/commission');
const allowAccessDto = require('../../dto/affiliates/allow_access');

const router = express.Router();

router.get('/', getAffiliatesController);

router.get('/ranking', getAffiliateRankingController);

router.get('/products/:id_affiliate', getAffiliateProductsController);

router.get('/export', exportAffiliates);

router.post('/exportAffiliatesEmail', exportAffiliatesEmailController);

router.get('/pending', getPendingAffiliatesController);

router.get('/pending/export', exportAffiliatesPeading);

router.get('/pending/count', getPendingCount);

router.put('/pending/all/:status', updatePendingStatus);

router.get('/filters', getFiltersController);

router.put(
  '/active/:id_affiliate',
  affiliateActiveInvite,
  setAffiliateActiveController,
);

router.put(
  '/block/:id_affiliate',
  affiliateBlockInvite,
  setAffiliateBlockController,
);

router.put(
  '/reject/:id_affiliate',
  affiliateRejectInvite,
  setAffiliateRejectController,
);

router.put(
  '/commission/:id_affiliate',
  validateDto(commissionDto),
  affiliateSetCommission,
  setAffiliateCommissionController,
);

router.get('/:affiliate_uuid', getAffiliateInfo);

router.put(
  '/allow/:id_affiliate',
  validateDto(allowAccessDto),
  affiliateAllowAccess,
  setAffiliateAllowAccessController,
);

router.get('/ranking/export', getExportAffiliateRanking);

router.get('/ranking/best-sellers', getBestSallersAffiliateRanking);

module.exports = router;
