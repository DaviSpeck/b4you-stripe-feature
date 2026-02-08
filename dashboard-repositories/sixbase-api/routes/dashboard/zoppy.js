const express = require('express');
const validateDto = require('../../middlewares/validate-dto');
const zoppyDto = require('../../dto/integrations/zoppy');
const {
  validateZoppyCredential,
  findSinglePluginZoppy,
} = require('../../middlewares/validatorsAndAdapters/integrations');
const {
  createZoppyIntegrationController,
  getZoppyIntegrationController,
  deleteZoppyIntegrationController,
  updateZoppyIntegrationController,
} = require('../../controllers/dashboard/integrations/zoppy');

const router = express.Router();

router.post(
  '/',
  validateDto(zoppyDto),
  validateZoppyCredential,
  createZoppyIntegrationController,
);

router.get('/', getZoppyIntegrationController);

router.put(
  '/:plugin_id',
  validateDto(zoppyDto),
  findSinglePluginZoppy,
  validateZoppyCredential,
  updateZoppyIntegrationController,
);

router.delete(
  '/:plugin_id',
  findSinglePluginZoppy,
  deleteZoppyIntegrationController,
);

module.exports = router;
