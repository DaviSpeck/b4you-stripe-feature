const ApiError = require('../../../error/ApiError');
const { findQuestionStatus } = require('../../../status/questionStatus');
const {
  findOneQuestion,
  updateQuestion,
} = require('../../../database/controllers/questions');
const { createAnswer } = require('../../../database/controllers/answers');

module.exports = class {
  constructor({ question_id, id_user, message }) {
    this.question_id = question_id;
    this.id_user = id_user;
    this.message = message;
  }

  async execute() {
    const question = await findOneQuestion({ uuid: this.question_id });
    if (!question) throw ApiError.badRequest('Pergunta não encontrada');
    const answer = await createAnswer({
      id_user: this.id_user,
      message: this.message,
      id_question: question.id,
    });
    await updateQuestion(
      { id: question.id },
      { status: findQuestionStatus(2).id },
    );
    return answer;
  }
};
