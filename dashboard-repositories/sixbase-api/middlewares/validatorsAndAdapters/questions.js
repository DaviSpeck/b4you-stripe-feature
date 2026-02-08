const ApiError = require('../../error/ApiError');
const { findOneQuestion } = require('../../database/controllers/questions');

const validateQuestion = async (req, res, next) => {
  const { question_id } = req.params;
  const {
    student: { id: id_student },
  } = req;
  try {
    const question = await findOneQuestion({ uuid: question_id, id_student });
    if (!question)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Pergunta não encontrada',
        }),
      );
    req.question = question;
    return next();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const validateUpdateQuestion = async (req, res, next) => {
  const { message } = req.body;

  if (!message)
    return next(
      ApiError.badRequest({
        success: false,
        message: 'Mensagem não encontrada',
      }),
    );

  return next();
};

const validateDeleteQuestion = async (req, res, next) => {
  const {
    question: { answers },
  } = req;

  if (answers.length > 0)
    return next(
      ApiError.badRequest({
        success: false,
        message: 'As perguntas possuem respostas',
      }),
    );
  return next();
};

module.exports = {
  validateQuestion,
  validateUpdateQuestion,
  validateDeleteQuestion,
};
