const express = require('express');

const router = express.Router();

const {
  createOmieIntegrationController,
  createTestOmieIntegrationController,
  getOmieIntegrationController,
  updateOmieIntegrationController,
  deactivateOmieIntegrationController,
} = require('../../../controllers/dashboard/omie');

const validateDto = require('../../../middlewares/validate-dto');
const createOmieSchema = require('../../../dto/integrations/omie/create');
const updateOmieSchema = require('../../../dto/integrations/omie/update');

router.post(
  '/',
  validateDto(createOmieSchema),
  createOmieIntegrationController,
);

router.post('/test', createTestOmieIntegrationController);

router.get('/', getOmieIntegrationController);

router.put('/', validateDto(updateOmieSchema), updateOmieIntegrationController);

router.delete('/', deactivateOmieIntegrationController);

module.exports = router;
