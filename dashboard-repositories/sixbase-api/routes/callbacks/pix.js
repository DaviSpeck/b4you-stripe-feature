const express = require('express');
const { callbackPixController } = require('../../controllers/callbacks/pix');

const router = express.Router();

router.post('/', callbackPixController);

module.exports = router;
