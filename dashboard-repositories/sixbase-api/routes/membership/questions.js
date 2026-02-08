const express = require('express');
const validateDTO = require('../../middlewares/validate-dto');
const createQuestionDTO = require('../../dto/questions/createQuestion');
const updateQuestionDTO = require('../../dto/questions/updateQuestion');

const router = express.Router();

const {
  validateLesson,
} = require('../../middlewares/validatorsAndAdapters/lessons');
const {
  findStudentProductByUUIDAdapter,
} = require('../../middlewares/validatorsAndAdapters/products');
const {
  verifyMutedStudent,
} = require('../../middlewares/validatorsAndAdapters/mutedStudent');
const {
  validateQuestion,
  validateUpdateQuestion,
  validateDeleteQuestion,
} = require('../../middlewares/validatorsAndAdapters/questions');
const {
  createQuestionController,
  updateQuestionController,
  deleteQuestionController,
  replyQuestionController,
  findQuestionsController,
} = require('../../controllers/membership/questions');

router.get(
  '/:product_id/:lesson_id',
  findStudentProductByUUIDAdapter,
  validateLesson,
  findQuestionsController,
);

router.post(
  '/:product_id/:lesson_id',
  validateDTO(createQuestionDTO),
  findStudentProductByUUIDAdapter,
  validateLesson,
  verifyMutedStudent,
  createQuestionController,
);

router.put(
  '/:product_id/:question_id',
  validateDTO(updateQuestionDTO),
  findStudentProductByUUIDAdapter,
  validateQuestion,
  verifyMutedStudent,
  validateUpdateQuestion,
  updateQuestionController,
);

router.delete(
  '/:product_id/:question_id',
  findStudentProductByUUIDAdapter,
  validateQuestion,
  validateDeleteQuestion,
  deleteQuestionController,
);

router.post(
  '/reply/:product_id/:lesson_id/:question_id',
  validateDTO(createQuestionDTO),
  findStudentProductByUUIDAdapter,
  validateLesson,
  validateQuestion,
  replyQuestionController,
);

module.exports = router;
