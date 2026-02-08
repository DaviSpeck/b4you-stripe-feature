const express = require('express');
const {
  findAllNotificationsController,
  findAndMarkAsReadController,
  markAllAsReadController,
} = require('../../controllers/dashboard/notifications');
const {
  validateNotification,
  findUserNotifications,
} = require('../../middlewares/validatorsAndAdapters/notifications');

const router = express.Router();

router.get('/', findAllNotificationsController);

router.get(
  '/:notification_id',
  validateNotification,
  findAndMarkAsReadController,
);

router.put('/', findUserNotifications, markAllAsReadController);

module.exports = router;
