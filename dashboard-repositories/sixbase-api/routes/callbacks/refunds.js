const express = require('express');
const {
  callbackRefundsController,
} = require('../../controllers/callbacks/refunds');

const router = express.Router();

router.post('/', callbackRefundsController);

module.exports = router;
