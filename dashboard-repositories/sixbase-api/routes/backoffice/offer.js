const express = require('express');
const {
  offerCacheController,
  blockController,
} = require('../../controllers/backoffice/offer');

const router = express.Router();

router.post('/', offerCacheController);

router.post('/blocks', blockController);

module.exports = router;
