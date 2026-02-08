const express = require('express');
const InvisionController = require('../../../controllers/dashboard/integrations/invision');
const validateDto = require('../../../middlewares/validate-dto');
const createDto = require('../../../dto/integrations/invision/create');

const router = express.Router();

router.post(
  '/',
  validateDto(createDto),
  InvisionController.createIntegrationController,
);

router.post('/:uuid', InvisionController.createIntegrationPluginController);

router.get('/', InvisionController.getIntegrationsController);

router.get('/:uuid', InvisionController.getIntegrationsPluginsController);

router.get('/info/:uuid', InvisionController.getInfo);

router.delete('/:uuid', InvisionController.deleteIntegrationController);

router.delete(
  '/:uuid/:uuid_plugin',
  InvisionController.deleteIntegrationRuleController,
);

module.exports = router;
