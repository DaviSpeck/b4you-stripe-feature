const express = require('express');
const { pixelsTypes } = require('../../types/pixelsTypes');

const router = express.Router();

router.get('/', async (req, res) => res.status(200).send(pixelsTypes));

module.exports = router;
