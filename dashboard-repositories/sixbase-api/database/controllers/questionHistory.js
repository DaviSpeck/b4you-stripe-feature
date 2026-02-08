const QuestionHistory = require('../models/Questions_history');

const createQuestionHistory = async (data) => {
  const history = await QuestionHistory.create(data);
  return history;
};

module.exports = {
  createQuestionHistory,
};
