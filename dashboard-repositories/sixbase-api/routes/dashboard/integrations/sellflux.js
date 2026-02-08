const express = require('express');
const validateDto = require('../../../middlewares/validate-dto');
const SellfluxController = require('../../../controllers/dashboard/integrations/sellflux');
const sellfluxDTO = require('../../../dto/integrations/sellflux');
const sellfluxProductDTO = require('../../../dto/integrations/sellfluxProduct');
const {
  findSingleLeadloversAdapter,
  findSingleProductPluginAdapter,
} = require('../../../middlewares/validatorsAndAdapters/leadlovers');
const {
  findSingleProductAdapter,
} = require('../../../middlewares/validatorsAndAdapters/products');
const {
  deleteOnePluginProductIntegrationController,
  deletePluginProductIntegrationController,
} = require('../../../controllers/dashboard/integrations/leadlovers');

const router = express.Router();

router.post(
  '/',
  validateDto(sellfluxDTO),
  SellfluxController.createSellFluxIntegrationController,
);

router.get('/', SellfluxController.getSellfluxIntegrationsController);

router.post(
  '/product/:product_id/plugin/:plugin_id',
  findSingleProductAdapter,
  validateDto(sellfluxProductDTO),
  SellfluxController.createSellfluxProductIntegrationsController,
);

router.get('/:plugin_id', SellfluxController.getSellfluxProductsController);

router.delete(
  '/:plugin_id',
  findSingleLeadloversAdapter,
  deletePluginProductIntegrationController,
);

router.delete(
  '/:plugin_id/:plugin_product_id',
  findSingleLeadloversAdapter,
  findSingleProductPluginAdapter,
  deleteOnePluginProductIntegrationController,
);

module.exports = router;
