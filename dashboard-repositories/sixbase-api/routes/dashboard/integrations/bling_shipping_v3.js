const express = require('express');
const validateDto = require('../../../middlewares/validate-dto');
const createCredentials = require('../../../dto/integrations/bling_shipping/create');
const BlingShippingController = require('../../../controllers/dashboard/integrations/bling_shipping_v3');

const router = express.Router();

router.post(
  '/',
  validateDto(createCredentials),
  BlingShippingController.createIntegrationController,
);
router.post('/code/:code', BlingShippingController.createTokenController);

router.get('/', BlingShippingController.getIntegrationsController);

router.put('/nfe', BlingShippingController.UpdateNfeConfigController);

router.delete('/', BlingShippingController.deleteIntegrationController);

router.get('/problems', BlingShippingController.getProblemsController);

router.post('/resend', BlingShippingController.resendController);

module.exports = router;
