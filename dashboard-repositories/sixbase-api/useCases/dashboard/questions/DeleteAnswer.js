const ApiError = require('../../../error/ApiError');
const { findOneQuestion } = require('../../../database/controllers/questions');
const {
  deleteAnswer,
  findOneAnswer,
} = require('../../../database/controllers/answers');

module.exports = class {
  constructor(question_id, answer_id, id_user) {
    this.question_id = question_id;
    this.answer_id = answer_id;
    this.id_user = id_user;
  }

  async execute() {
    const question = await findOneQuestion({
      uuid: this.question_id,
      id_user: this.id_user,
    });
    if (!question) throw ApiError.badRequest('Pergunta não encontrada');
    const answer = await findOneAnswer({
      uuid: this.answer_id,
      id_user: this.id_user,
    });
    if (!answer) throw ApiError.badRequest('answer not found');
    await deleteAnswer({ id: answer.id });
  }
};
