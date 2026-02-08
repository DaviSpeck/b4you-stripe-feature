const express = require('express');
const { incrementMerlinInteractions, getMerlinInteractions } = require('../../controllers/marketing/merlinInteractions');

const router = express.Router();

router.post('/merlin/interactions', incrementMerlinInteractions);
router.get('/merlin/interactions/:id_user', getMerlinInteractions);


module.exports = router;