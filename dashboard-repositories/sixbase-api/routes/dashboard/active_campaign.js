const express = require('express');
const validateDto = require('../../middlewares/validate-dto');
const {
  createActiveCampaignIntegrationController,
  createActiveCampaignProductController,
  deleteCredentialActiveCampaignController,
  deleteProductPluginActiveCampaignController,
  getActiveCampaignByProductController,
  getActiveCampaignIntegrationsController,
  getActiveCampaignProductsController,
  getListsActiveCampaignController,
  getTagsActiveCampaignController,
} = require('../../controllers/dashboard/integrations/active_campaigns');
const {
  findSingleProductAdapter,
} = require('../../middlewares/validatorsAndAdapters/products');
const {
  validateActiveCampaign,
  findSinglePluginAdapter,
} = require('../../middlewares/validatorsAndAdapters/integrations');
const {
  findSingleProductPluginAdapter,
} = require('../../middlewares/validatorsAndAdapters/leadlovers');
const activeCampaignDto = require('../../dto/integrations/activeCampaign');
const activeCampaignProductPluginDto = require('../../dto/integrations/activeCampaignProductPlugin');

const router = express.Router();

router.post(
  '/',
  validateDto(activeCampaignDto),
  validateActiveCampaign,
  createActiveCampaignIntegrationController,
);

router.post(
  '/product/:product_id/plugin/:plugin_id',
  findSingleProductAdapter,
  findSinglePluginAdapter,
  validateDto(activeCampaignProductPluginDto),
  createActiveCampaignProductController,
);

router.get('/', getActiveCampaignIntegrationsController);

router.get(
  '/lists/:plugin_id',
  findSinglePluginAdapter,
  getListsActiveCampaignController,
);

router.get(
  '/tags/:plugin_id',
  findSinglePluginAdapter,
  getTagsActiveCampaignController,
);

router.get(
  '/:plugin_id',
  findSinglePluginAdapter,
  getActiveCampaignProductsController,
);

router.get(
  '/:plugin_id/product/:product_id',
  findSinglePluginAdapter,
  findSingleProductAdapter,
  getActiveCampaignByProductController,
);

router.delete(
  '/:plugin_id/:plugin_product_id',
  findSinglePluginAdapter,
  findSingleProductPluginAdapter,
  deleteProductPluginActiveCampaignController,
);

router.delete(
  '/:plugin_id',
  findSinglePluginAdapter,
  deleteCredentialActiveCampaignController,
);

module.exports = router;
