const express = require('express');
const {
  callbackBilletController,
} = require('../../controllers/callbacks/billet');

const router = express.Router();

router.post('/', callbackBilletController);

module.exports = router;
