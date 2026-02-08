const express = require('express');
const validateDto = require('../../../middlewares/validate-dto');
const createCredentials = require('../../../dto/integrations/bling_shipping/createv2');
const BlingShippingController = require('../../../controllers/dashboard/integrations/bling_shipping');

const router = express.Router();

router.post(
  '/',
  validateDto(createCredentials),
  BlingShippingController.createIntegrationController,
);

router.get('/', BlingShippingController.getIntegrationsController);

router.put(
  '/',
  validateDto(createCredentials),
  BlingShippingController.updateIntegrationController,
);

router.delete('/', BlingShippingController.deleteIntegrationController);

module.exports = router;
