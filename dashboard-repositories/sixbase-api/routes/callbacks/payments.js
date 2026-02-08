const express = require('express');

const router = express.Router();

router.use('/billet', require('./billet'));
router.use('/pix', require('./pix'));
router.use('/card', require('./card'));

module.exports = router;
