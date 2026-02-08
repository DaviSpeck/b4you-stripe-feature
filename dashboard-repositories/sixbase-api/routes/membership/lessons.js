const express = require('express');

const router = express.Router();
const validateDto = require('../../middlewares/validate-dto');
const updateLessonHistoryDTO = require('../../dto/lessons/updateLessonHistory');
const {
  validateLessonHistory,
} = require('../../middlewares/validatorsAndAdapters/lessonHistory');
const {
  updateHistoryController,
} = require('../../controllers/membership/studyHistory');
const Middlewares = require('../../middlewares/validatorsAndAdapters/lesson_notes');

router.put(
  '/history',
  validateDto(updateLessonHistoryDTO),
  validateLessonHistory,
  updateHistoryController,
);

router.use(
  '/:lesson_id/notes',
  Middlewares.findLessonProduct,
  require('./lesson_notes'),
);

router.use(
  '/:lesson_id/comments',
  Middlewares.findLessonProduct,
  require('./lesson_comments'),
);

module.exports = router;
