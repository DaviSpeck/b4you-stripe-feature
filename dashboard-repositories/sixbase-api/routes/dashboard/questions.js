const express = require('express');
const validateDTO = require('../../middlewares/validate-dto');
const answerQuestionDTO = require('../../dto/questions/answerQuestion');
const {
  findQuestionStatusController,
  findQuestionsController,
  replyQuestionController,
  findSingleQuestionController,
  deleteQuestionController,
  deleteAnswerController,
} = require('../../controllers/dashboard/questions');

const router = express.Router();

router.get('/', findQuestionsController);

router.get('/status', findQuestionStatusController);

router.get('/:question_id', findSingleQuestionController);

router.post(
  '/:question_id',
  validateDTO(answerQuestionDTO),
  replyQuestionController,
);

router.delete('/:question_id', deleteQuestionController);

router.delete('/:question_id/:answer_id', deleteAnswerController);

module.exports = router;
