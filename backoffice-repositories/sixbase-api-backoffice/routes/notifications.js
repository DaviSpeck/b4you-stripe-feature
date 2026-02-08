const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification');
const NotificationEventsController = require('../controllers/notification-events');
const { createNotificationSchema, resolveEmailsSchema } = require('../schemas/notifications');
const validateDto = require('../middlewares/validate-dto');

// Botmaker events management (SEM ID genérico antes)
router.get('/events', NotificationEventsController.list);
router.get('/events/:id', NotificationEventsController.getById);
router.patch('/events/:id', NotificationEventsController.update);

// Notifications (CRUD manual)
router.get('/', NotificationController.list);

router.post(
    '/resolve-emails',
    validateDto(resolveEmailsSchema, 'body'),
    NotificationController.resolveEmailsToUUIDs
);

router.post(
    '/test-push-notification',
    validateDto(createNotificationSchema, 'body'),
    NotificationController.testNotification
);

router.post(
    '/send-push-notification',
    validateDto(createNotificationSchema, 'body'),
    NotificationController.create
);

router.get('/:id', NotificationController.getById);
router.delete('/:id', NotificationController.delete);

module.exports = router;