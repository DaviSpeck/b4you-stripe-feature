const express = require('express');
const validateDto = require('../../middlewares/validate-dto');
const {
  validateEnotas,
  findSingleEnotasAdapter,
} = require('../../middlewares/validatorsAndAdapters/enotas');
const {
  createEnotasIntegrationController,
  getEnotasIntegrationsController,
  deleteEnotasIntegrationController,
  updateEnotasIntegrationController,
} = require('../../controllers/dashboard/integrations/enotas');
const enotasDTO = require('../../dto/integrations/enotas');

const router = express.Router();

router.post(
  '/',
  validateDto(enotasDTO),
  validateEnotas,
  createEnotasIntegrationController,
);

router.get('/', getEnotasIntegrationsController);

router.delete('/', findSingleEnotasAdapter, deleteEnotasIntegrationController);

router.put('/', findSingleEnotasAdapter, updateEnotasIntegrationController);

module.exports = router;
