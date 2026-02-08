const express = require('express');
const validateDto = require('../../../middlewares/validate-dto');
const createWebhookSchema = require('../../../dto/integrations/arco/create');
const updateWebhookSchema = require('../../../dto/integrations/arco/update');
const arcoController = require('../../../controllers/dashboard/integrations/arco');

const router = express.Router();

router.post('/', validateDto(createWebhookSchema), arcoController.create);

router.put(
  '/:webhook_uuid',
  validateDto(updateWebhookSchema),
  arcoController.update,
);

router.get('/', arcoController.get);

router.delete('/:webhook_uuid', arcoController.delete);

module.exports = router;
