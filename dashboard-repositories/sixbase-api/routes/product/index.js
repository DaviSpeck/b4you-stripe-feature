const express = require('express');

const router = express.Router();

const { redirectController } = require('../../controllers/product/product');

router.get('/:redirect/:offer_id/:affiliate_id', redirectController);

module.exports = router;
