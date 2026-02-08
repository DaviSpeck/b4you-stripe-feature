const express = require('express');
const BlingController = require('../../../controllers/dashboard/integrations/bling');
const createCredentials = require('../../../dto/integrations/createBling');
const validateDto = require('../../../middlewares/validate-dto');

const router = express.Router();

router.post(
  '/',
  validateDto(createCredentials),
  BlingController.createIntegrationController,
);

router.get('/', BlingController.getIntegrationsController);

router.put(
  '/',
  validateDto(createCredentials),
  BlingController.updateIntegrationController,
);

router.delete('/', BlingController.deleteIntegrationController);

module.exports = router;
