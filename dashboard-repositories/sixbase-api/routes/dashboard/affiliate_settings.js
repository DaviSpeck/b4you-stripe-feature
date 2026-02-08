const express = require('express');
const validateDto = require('../../middlewares/validate-dto');
const affiliateSettingsDto = require('../../dto/products/settingsAffiliate');
const affiliateInvite = require('../../dto/products/affiliateInvite');
const listOnMarketDto = require('../../dto/products/listOnMarket');
const {
  updateListOnMarketController,
} = require('../../controllers/dashboard/products');
const {
  getAffiliateSettingsController,
  updateAffiliateSettingsController,
  getProductsAffiliate,
  getSelectedProductsAffiliate,
  createProductAffiliations,
  deleteProductAffiliation,
  applyBulkCommissionController,
} = require('../../controllers/dashboard/affiliate_settings');
const {
  findAllAffiliatesByProductController,
  inviteUserToAffiliateController,
} = require('../../controllers/dashboard/affiliates');

const router = express.Router();

router.put(
  '/',
  validateDto(affiliateSettingsDto),
  updateAffiliateSettingsController,
);

router.put(
  '/market',
  validateDto(listOnMarketDto),
  updateListOnMarketController,
);

router.get('/', getAffiliateSettingsController);

router.get('/all', findAllAffiliatesByProductController);

router.post(
  '/invite',
  validateDto(affiliateInvite),
  inviteUserToAffiliateController,
);

router.get('/products', getProductsAffiliate);

router.get('/selected', getSelectedProductsAffiliate);

router.post('/link', createProductAffiliations);

router.delete('/link/:id_product', deleteProductAffiliation);

router.post('/commission/bulk', applyBulkCommissionController);

module.exports = router;
