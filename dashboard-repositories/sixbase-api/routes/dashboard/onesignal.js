const express = require('express');
const validateDTO = require('../../middlewares/validate-dto');
const syncDTO = require('../../dto/onesignal/sync');
const OnesignalController = require('../../controllers/dashboard/onesignal');

const router = express.Router();

router.get('/notifications', OnesignalController.listUserNotifications);

router.put('/notify-integrations/:id/read', OnesignalController.setRead);

router.patch('/sync', validateDTO(syncDTO), OnesignalController.sync);

module.exports = router;
