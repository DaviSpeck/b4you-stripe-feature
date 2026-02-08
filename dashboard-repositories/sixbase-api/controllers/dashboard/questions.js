const ApiError = require('../../error/ApiError');
const SerializeQuestionsAndAnswers = require('../../presentation/dashboard/QuestionAndAnswers');
const ReplyQuestionUseCase = require('../../useCases/dashboard/questions/ReplyQuestion');
const FindSelectedQuestionUseCase = require('../../useCases/dashboard/questions/FindSelectedQuestion');
const DeleteQuestionUseCase = require('../../useCases/dashboard/questions/DeleteQuestion');
const DeleteAnswerUseCase = require('../../useCases/dashboard/questions/DeleteAnswer');
const {
  findQuestionsPaginated,
  findOneQuestion,
} = require('../../database/controllers/questions');
const { questionStatus } = require('../../status/questionStatus');

const findQuestionStatusController = async (req, res) =>
  res.status(200).send(questionStatus);

const findQuestionsController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { page = 0, size = 10 },
  } = req;
  try {
    const { count, rows } = await findQuestionsPaginated(page, size, {
      id_user,
    });
    return res
      .status(200)
      .send({ count, rows: new SerializeQuestionsAndAnswers(rows).adapt() });
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

const replyQuestionController = async (req, res, next) => {
  const {
    user: { id: id_user },
    body: { message },
    params: { question_id },
  } = req;
  try {
    await new ReplyQuestionUseCase({
      question_id,
      id_user,
      message,
    }).execute();
    const question = await findOneQuestion({ uuid: question_id });
    return res
      .status(200)
      .send(new SerializeQuestionsAndAnswers(question).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const findSingleQuestionController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { question_id },
  } = req;
  try {
    const question = await new FindSelectedQuestionUseCase(
      question_id,
      id_user,
    ).execute();
    return res
      .status(200)
      .send(new SerializeQuestionsAndAnswers(question).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const deleteQuestionController = async (req, res, next) => {
  const {
    params: { question_id },
    user: { id: id_user },
  } = req;
  try {
    await new DeleteQuestionUseCase(question_id, id_user).execute();
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const deleteAnswerController = async (req, res, next) => {
  const {
    params: { question_id, answer_id },
    user: { id: id_user },
  } = req;
  try {
    await new DeleteAnswerUseCase(question_id, answer_id, id_user).execute();
    const question = await findOneQuestion({ uuid: question_id });
    return res
      .status(200)
      .send(new SerializeQuestionsAndAnswers(question).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

module.exports = {
  findQuestionStatusController,
  findQuestionsController,
  replyQuestionController,
  findSingleQuestionController,
  deleteQuestionController,
  deleteAnswerController,
};
