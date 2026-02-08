const ApiError = require('../../../error/ApiError');
const { findOneQuestion } = require('../../../database/controllers/questions');

module.exports = class {
  constructor(question_id, id_user) {
    this.question_id = question_id;
    this.id_user = id_user;
  }

  async execute() {
    const question = await findOneQuestion({
      uuid: this.question_id,
      id_user: this.id_user,
    });
    if (!question) throw ApiError.badRequest('Pergunta não encontrada');
    return question;
  }
};
