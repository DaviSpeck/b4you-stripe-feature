const ApiError = require('../../../error/ApiError');
const {
  findOneQuestion,
  deleteQuestion,
} = require('../../../database/controllers/questions');
const { deleteAnswer } = require('../../../database/controllers/answers');

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
    const { answers } = question;
    await deleteQuestion({ id: question.id });
    if (Array.isArray(answers) && answers.length > 0) {
      const answersIds = answers.map(({ id }) => id);
      await deleteAnswer({ id: answersIds });
    }
  }
};
