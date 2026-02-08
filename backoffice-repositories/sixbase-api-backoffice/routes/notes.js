const express = require('express');
const router = express.Router();

const NotesController = require('../controllers/notes');

router.get('/:noteUuid/history', NotesController.history);

router.get('/', NotesController.list);

module.exports = router;
