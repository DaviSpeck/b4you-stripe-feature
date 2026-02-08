const express = require('express');
const validateDto = require('../../../middlewares/validate-dto');
const {
  findSingleLeadloversAdapter: findSingleCademiAdapter,
  findSingleProductPluginAdapter,
} = require('../../../middlewares/validatorsAndAdapters/leadlovers');
const {
  deleteOnePluginProductIntegrationController,
  deletePluginProductIntegrationController,
} = require('../../../controllers/dashboard/integrations/leadlovers');
const {
  findSingleProductAdapter,
} = require('../../../middlewares/validatorsAndAdapters/products');
const createCredentials = require('../../../dto/integrations/utmify');
const createProduct = require('../../../dto/integrations/cademiProduct');

const UtmifyController = require('../../../controllers/dashboard/integrations/utmify');

const router = express.Router();

router.post(
  '/',
  validateDto(createCredentials),
  UtmifyController.createIntegrationController,
);

router.get('/', UtmifyController.getIntegrationsController);

router.post(
  '/product/:product_id/plugin/:plugin_id',
  findSingleProductAdapter,
  validateDto(createProduct),
  UtmifyController.createProductIntegrationController,
);

router.get('/:plugin_id', UtmifyController.getProductsController);

router.delete(
  '/:plugin_id',
  findSingleCademiAdapter,
  deletePluginProductIntegrationController,
);

router.delete(
  '/:plugin_id/:plugin_product_id',
  findSingleCademiAdapter,
  findSingleProductPluginAdapter,
  deleteOnePluginProductIntegrationController,
);

module.exports = router;
