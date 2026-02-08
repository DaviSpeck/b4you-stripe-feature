const express = require('express');

const router = express.Router({ mergeParams: true });
const validateDto = require('../../middlewares/validate-dto');
const createLessonCommentDto = require('../../dto/lessons/createLessonComment');
const updateLessonCommentDto = require('../../dto/lessons/updateLessonComment');
const {
  createLessonCommentController,
  deleteLessonCommentController,
  getLessonCommentsController,
  updateLessonCommentController,
} = require('../../controllers/membership/lesson_comments');

router.get('/', getLessonCommentsController);
router.post('/', validateDto(createLessonCommentDto), createLessonCommentController);
router.put(
  '/:comment_id',
  validateDto(updateLessonCommentDto),
  updateLessonCommentController,
);
router.delete('/:comment_id', deleteLessonCommentController);

module.exports = router;

