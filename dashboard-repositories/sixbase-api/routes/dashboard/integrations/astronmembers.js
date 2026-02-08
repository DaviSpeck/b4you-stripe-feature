const express = require('express');
const validateDto = require('../../../middlewares/validate-dto');
const AstronMembersController = require('../../../controllers/dashboard/integrations/astronmembers');
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
  AstronMembersController.createAstronmembersIntegrationController,
);

router.get('/', AstronMembersController.getAstronmembersIntegrationsController);

router.post(
  '/product/:product_id/plugin/:plugin_id',
  findSingleProductAdapter,
  validateDto(sellfluxProductDTO),
  AstronMembersController.createAstronmembersProductIntegrationsController,
);

router.get(
  '/:plugin_id',
  AstronMembersController.getAstronmembersProductsController,
);

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
