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
const createCredentials = require('../../../dto/integrations/cademi');
const createProduct = require('../../../dto/integrations/cademiProduct');

const CademiController = require('../../../controllers/dashboard/integrations/cademi');

const router = express.Router();

router.post(
  '/',
  validateDto(createCredentials),
  CademiController.createIntegrationController,
);

router.get('/', CademiController.getIntegrationsController);

router.post(
  '/product/:product_id/plugin/:plugin_id',
  findSingleProductAdapter,
  validateDto(createProduct),
  CademiController.createProductIntegrationController,
);

router.get('/:plugin_id', CademiController.getProductsController);

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
