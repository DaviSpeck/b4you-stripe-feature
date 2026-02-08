const express = require('express');
const validateDto = require('../../../middlewares/validate-dto');
const NotazzController = require('../../../controllers/dashboard/integrations/notazz');
const createDto = require('../../../dto/integrations/notazz/create');

const router = express.Router();

router.post(
  '/',
  validateDto(createDto),
  NotazzController.createIntegrationController,
);

router.get('/', NotazzController.getIntegrationsController);

router.delete('/:uuid', NotazzController.deleteIntegrationController);

router.put('/', NotazzController.updateNotazzIntegrationController);

module.exports = router;
