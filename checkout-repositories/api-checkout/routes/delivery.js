const express = require('express');

const router = express.Router();

const { deliveryController } = require('../controllers/delivery');

router.get('/:sale_item_id', deliveryController);

module.exports = router;
