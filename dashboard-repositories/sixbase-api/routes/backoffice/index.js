const express = require('express');

const router = express.Router();

router.use('/offer', require('./offer'));

module.exports = router;
