const express = require('express');
const router = express.Router();
const affiliatesController = require('../controllers/affiliates');

router.get('/:productUuid/', affiliatesController.findAllAffiliates);

module.exports = router;
