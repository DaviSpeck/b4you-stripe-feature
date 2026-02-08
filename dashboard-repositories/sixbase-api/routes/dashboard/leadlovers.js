const express = require('express');
const validateDto = require('../../middlewares/validate-dto');
const leadloversDTO = require('../../dto/integrations/leadLovers');
const leadLoversProductsDTO = require('../../dto/integrations/leadLoversProduct');
const {
  createLeadloversIntegrationController,
  createLeadloversProductIntegrationController,
  deleteOnePluginProductIntegrationController,
  deletePluginProductIntegrationController,
  getLeadloversByProductController,
  getLeadloversIntegrationsController,
  getLeadloversLevelsController,
  getLeadloversMachinesController,
  getLeadloversProductsController,
  getLeadloversSequenceController,
} = require('../../controllers/dashboard/integrations/leadlovers');
const {
  findSingleProductPluginAdapter,
  findSingleLeadloversAdapter,
  validateLeadlovers,
} = require('../../middlewares/validatorsAndAdapters/leadlovers');
const {
  findSingleProductAdapter,
} = require('../../middlewares/validatorsAndAdapters/products');

const router = express.Router();

router.post(
  '/',
  validateDto(leadloversDTO),
  validateLeadlovers,
  createLeadloversIntegrationController,
);

router.post(
  '/product/:product_id/plugin/:plugin_id',
  findSingleProductAdapter,
  findSingleLeadloversAdapter,
  validateDto(leadLoversProductsDTO),
  createLeadloversProductIntegrationController,
);

router.get('/', getLeadloversIntegrationsController);

router.get(
  '/:plugin_id',
  findSingleLeadloversAdapter,
  getLeadloversProductsController,
);

router.get(
  '/:plugin_id/product/:product_id',
  findSingleLeadloversAdapter,
  findSingleProductAdapter,
  getLeadloversByProductController,
);

router.get(
  '/:plugin_id/machines',
  findSingleLeadloversAdapter,
  getLeadloversMachinesController,
);

router.get(
  '/:plugin_id/machines/:machine_uuid/sequences',
  findSingleLeadloversAdapter,
  getLeadloversSequenceController,
);

router.get(
  '/:plugin_id/machines/:machine_uuid/sequences/:sequence_uuid/levels',
  findSingleLeadloversAdapter,
  getLeadloversLevelsController,
);

router.delete(
  '/:plugin_id/:plugin_product_id',
  findSingleLeadloversAdapter,
  findSingleProductPluginAdapter,
  deleteOnePluginProductIntegrationController,
);

router.delete(
  '/:plugin_id',
  findSingleLeadloversAdapter,
  deletePluginProductIntegrationController,
);

module.exports = router;
