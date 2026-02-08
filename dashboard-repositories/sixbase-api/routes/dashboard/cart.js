const express = require('express');

const router = express.Router();

const CartController = require('../../controllers/dashboard/cart');

router.get('/abandoned/:offer_uuid', CartController.getAbandonedCarts);

module.exports = router;
