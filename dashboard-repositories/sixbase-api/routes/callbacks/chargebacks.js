const express = require('express');
const { callbackCardController } = require('../../controllers/callbacks/card');

const router = express.Router();

router.post('/', callbackCardController);

module.exports = router;
