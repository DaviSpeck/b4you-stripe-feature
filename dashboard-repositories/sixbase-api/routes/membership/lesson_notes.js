const express = require('express');
const validateDto = require('../../middlewares/validate-dto');
const createNoteDTO = require('../../dto/lesson_notes/create');
const LessonNotesController = require('../../controllers/membership/lesson_notes');

const router = express.Router();

router.post(
  '/',
  validateDto(createNoteDTO),
  LessonNotesController.createLessonNoteController,
);

router.get('/', LessonNotesController.getLessonNotesController);

router.delete('/:note_id', LessonNotesController.deleteLessonNoteController);

module.exports = router;
