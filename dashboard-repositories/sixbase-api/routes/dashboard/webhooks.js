const express = require('express');
const validateDto = require('../../middlewares/validate-dto');
const createWebhookSchema = require('../../dto/webhooks/createWebhook');
const verifyWebhookSchema = require('../../dto/webhooks/verifyWebhook');
const updateWebhookSchema = require('../../dto/webhooks/updateWebhook');
const testWebhookSchema = require('../../dto/webhooks/testing');
const webhooksControllers = require('../../controllers/dashboard/integrations/webhooks');

const router = express.Router();

router.post(
  '/',
  validateDto(createWebhookSchema),
  webhooksControllers.createWebhook,
);

router.post(
  '/verify',
  validateDto(verifyWebhookSchema),
  webhooksControllers.verifyWebhook,
);

router.put(
  '/:webhook_uuid',
  validateDto(updateWebhookSchema),
  webhooksControllers.updateWebhook,
);

router.get('/', webhooksControllers.getUserWebhooks);

router.get('/logs/history/:id', webhooksControllers.getUserHistoryWebhooks);

router.delete('/:webhook_uuid', webhooksControllers.deleteWebhook);

router.post(
  '/test',
  validateDto(testWebhookSchema),
  webhooksControllers.testWebhooks,
);

router.post('/resend', webhooksControllers.resendWebhook);

module.exports = router;
