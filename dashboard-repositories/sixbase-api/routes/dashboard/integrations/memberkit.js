const express = require('express');
const MemberkitController = require('../../../controllers/dashboard/integrations/memberkit');
const validateDto = require('../../../middlewares/validate-dto');
const createDto = require('../../../dto/integrations/memberkit/create');

const router = express.Router();

router.post(
  '/',
  validateDto(createDto),
  MemberkitController.createIntegrationController,
);

router.post('/:uuid', MemberkitController.createIntegrationPluginController);

router.get('/', MemberkitController.getIntegrationsController);

router.get('/:uuid', MemberkitController.getIntegrationsPluginsController);

router.get('/info/:uuid', MemberkitController.getInfo);

router.delete('/:uuid', MemberkitController.deleteIntegrationController);

router.delete(
  '/:uuid/:uuid_plugin',
  MemberkitController.deleteIntegrationRuleController,
);

module.exports = router;
