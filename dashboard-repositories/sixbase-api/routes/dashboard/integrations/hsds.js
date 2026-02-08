const express = require('express');
const HSDSController = require('../../../controllers/dashboard/integrations/hsds');

const router = express.Router();

router.post('/', HSDSController.createIntegrationController);

router.get('/', HSDSController.getIntegrationsController);

router.delete('/', HSDSController.deleteIntegrationController);

module.exports = router;
