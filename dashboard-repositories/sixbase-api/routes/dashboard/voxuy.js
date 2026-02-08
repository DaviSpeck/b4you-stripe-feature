const express = require('express');
const validateDto = require('../../middlewares/validate-dto');
const voxuyDTO = require('../../dto/integrations/voxuy');
const voxuyProductDTO = require('../../dto/integrations/voxuyProduct');
const VoxuyController = require('../../controllers/dashboard/integrations/voxuy');
const {
  findSingleProductAdapter,
} = require('../../middlewares/validatorsAndAdapters/products');

const {
  deleteOnePluginProductIntegrationController,
  deletePluginProductIntegrationController,
} = require('../../controllers/dashboard/integrations/leadlovers');
const {
  findSingleProductPluginAdapter,
  findSingleLeadloversAdapter,
} = require('../../middlewares/validatorsAndAdapters/leadlovers');

const router = express.Router();

router.post(
  '/',
  validateDto(voxuyDTO),
  VoxuyController.createVoxuyIntegrationController,
);

router.post(
  '/product/:product_id/plugin/:plugin_id',
  findSingleProductAdapter,
  validateDto(voxuyProductDTO),
  VoxuyController.createVoxuyProductIntegrationController,
);

router.get('/', VoxuyController.getVoxuyIntegrationsController);

router.get('/:plugin_id', VoxuyController.getVoxuyProductsController);

router.get(
  '/:plugin_id/product/:product_id',
  findSingleProductAdapter,
  VoxuyController.getVoxuyByProductController,
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
