const express = require('express');

const router = express.Router();
const eventsController = require('../controllers/events');

router.get('/all', eventsController.findProducts);

router.get('/product/:productUuid', eventsController.productEvents);

module.exports = router;
