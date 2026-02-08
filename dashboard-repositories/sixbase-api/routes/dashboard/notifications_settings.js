const express = require('express');
const NotificationsSettingsController = require('../../controllers/dashboard/notifications_settings');
const validateDTO = require('../../middlewares/validate-dto');
const update = require('../../dto/users/notificationSettings');

const router = express.Router();

router.get('/', NotificationsSettingsController.getUserInfo);

router.put(
  '/',
  validateDTO(update),
  NotificationsSettingsController.updateUserInfo,
);

module.exports = router;
