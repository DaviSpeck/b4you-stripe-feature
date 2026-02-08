const express = require('express');

const router = express.Router();
const {
  redirectShortLinkController,
} = require('../../controllers/redirect/redirect');

router.get('/:short_id/:extra(*)?', redirectShortLinkController);

module.exports = router;
