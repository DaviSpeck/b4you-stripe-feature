const express = require('express');
const validateDto = require('../../middlewares/validate-dto');
const mailchimpDTO = require('../../dto/integrations/mailChimp');
const mailChimpProductDTO = require('../../dto/integrations/mailChimpProduct');
const {
  validateMailChimp,
  findSingleMailChimpIntegration,
} = require('../../middlewares/validatorsAndAdapters/mailchimp');
const {
  findSingleProductAdapter,
} = require('../../middlewares/validatorsAndAdapters/products');
const {
  createMailChimpIntegrationController,
  createMailChimpProductController,
  getMailChimpByProductController,
  getMailChimpIntegrationController,
  getMailChimpListsController,
  getMailChimpProductsController,
  deleteMailChimpProductPluginController,
  deleteMailChimpIntegrationController,
} = require('../../controllers/dashboard/integrations/mailchimp');
const {
  findSingleProductPluginAdapter,
} = require('../../middlewares/validatorsAndAdapters/leadlovers');

const router = express.Router();

router.post(
  '/',
  validateDto(mailchimpDTO),
  validateMailChimp,
  createMailChimpIntegrationController,
);

router.post(
  '/product/:product_id/plugin/:plugin_id',
  findSingleProductAdapter,
  findSingleMailChimpIntegration,
  validateDto(mailChimpProductDTO),
  createMailChimpProductController,
);

router.get('/', getMailChimpIntegrationController);

router.get(
  '/lists/:plugin_id',
  findSingleMailChimpIntegration,
  getMailChimpListsController,
);

router.get(
  '/:plugin_id',
  findSingleMailChimpIntegration,
  getMailChimpProductsController,
);

router.get(
  '/:plugin_id/product/:product_id',
  findSingleMailChimpIntegration,
  findSingleProductAdapter,
  getMailChimpByProductController,
);

router.delete(
  '/:plugin_id/:plugin_product_id',
  findSingleMailChimpIntegration,
  findSingleProductPluginAdapter,
  deleteMailChimpProductPluginController,
);

router.delete(
  '/:plugin_id',
  findSingleMailChimpIntegration,
  deleteMailChimpIntegrationController,
);

module.exports = router;
