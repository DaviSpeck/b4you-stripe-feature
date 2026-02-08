const express = require('express');
const validateDto = require('../../middlewares/validate-dto');
const hotzappDto = require('../../dto/integrations/hotzapp');
const {
  validateHotzappCredential,
  findSinglePluginHotzapp,
} = require('../../middlewares/validatorsAndAdapters/integrations');
const {
  createHotzappCredentialsIntegrationController,
  deleteHotzappCredentialController,
  findCredentialsController,
} = require('../../controllers/dashboard/integrations/hotzapp');

const router = express.Router();

router.post(
  '/',
  validateDto(hotzappDto),
  validateHotzappCredential,
  createHotzappCredentialsIntegrationController,
);

router.delete(
  '/:plugin_uuid',
  findSinglePluginHotzapp,
  deleteHotzappCredentialController,
);

router.get('/', findCredentialsController);

module.exports = router;
