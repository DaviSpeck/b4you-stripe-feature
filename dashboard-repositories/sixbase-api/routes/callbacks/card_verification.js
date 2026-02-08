const express = require('express');
const {
  callbackChargebackController,
} = require('../../controllers/callbacks/chargebacks');

const router = express.Router();

router.post('/', callbackChargebackController);

module.exports = router;
