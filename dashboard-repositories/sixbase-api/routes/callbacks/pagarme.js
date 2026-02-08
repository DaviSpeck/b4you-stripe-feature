const express = require('express');
const {
  pagarmeCallbackController,
} = require('../../controllers/callbacks/pagarme');

const router = express.Router();

router.post('/', pagarmeCallbackController);

module.exports = router;
