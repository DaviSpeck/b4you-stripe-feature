const express = require('express');
const auth = require('../../middlewares/auth');
const {
  getIntegrationNotificationsController,
  markIntegrationNotificationAsReadController,
  blingReadController,
  updateDataController,
  resendBlingController,
} = require('../../controllers/dashboard/integrationNotifications');

const router = express.Router();

router.get('/', auth, getIntegrationNotificationsController);

router.put('/:id/read', auth, markIntegrationNotificationAsReadController);

router.get('/:id/action/bling', auth, blingReadController);

router.put('/:id/action/bling', auth, updateDataController);

router.post('/:id/action/bling/resend', auth, resendBlingController);

module.exports = router;
