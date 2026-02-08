const express = require('express');

const router = express.Router();

const {
  findAllNotificationsController,
  findAndMarkAsReadController,
  markAllAsReadController,
} = require('../../controllers/membership/notifications');

const {
  validateNotification,
  findNotifications,
} = require('../../middlewares/validatorsAndAdapters/notifications');

router.get('/', findAllNotificationsController);

router.get(
  '/:notification_id',
  validateNotification,
  findAndMarkAsReadController,
);

router.put('/', findNotifications, markAllAsReadController);

module.exports = router;
