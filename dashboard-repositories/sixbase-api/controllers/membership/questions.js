const ApiError = require('../../error/ApiError');
const SerializeQuestions = require('../../presentation/common/Questions');
const ResolveDeepNesting = require('../../presentation/common/ResolveDeepNestedQuestions');
const CreateNotificationUseCase = require('../../useCases/dashboard/notifications/createNotification');
const { findNotificationType } = require('../../types/notificationsTypes');
const {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  findAllQuestions,
} = require('../../database/controllers/questions');
const {
  createQuestionHistory,
} = require('../../database/controllers/questionHistory');

const createQuestionController = async (req, res, next) => {
  const {
    student: { id: id_student },
    lesson: { id: id_lesson },
    product: {
      producer: { id: id_user },
    },
  } = req;
  const { title, message } = req.body;
  try {
    const question = await createQuestion({
      id_student,
      id_lesson,
      title,
      message,
    });
    await new CreateNotificationUseCase({
      id_user,
      type: findNotificationType('Perguntas').id,
      title: 'Pergunta',
      content: `Sua aula recebeu uma nova pergunta`,
      key: 'questions',
      variant: 'light',
      params: { question_uuid: question.uuid },
    }).execute();
    return res.status(200).send(new SerializeQuestions(question).adapt());
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

const updateQuestionController = async (req, res, next) => {
  const { message } = req.body;
  const {
    question,
    student: { id: id_student },
  } = req;
  try {
    await updateQuestion({ id: question.id, id_student }, { message });
    await createQuestionHistory({
      id_question: question.id,
      message: question.message,
      title: question.title,
    });
    return res.status(200).send({ success: true, message: 'Pergunta editada' });
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

const deleteQuestionController = async (req, res, next) => {
  const { question } = req;
  try {
    await deleteQuestion(question.id);
    return res
      .status(200)
      .send({ success: true, message: 'Pergunta deletada' });
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
  const { student, lesson, question } = req;
  const { title, message } = req.body;
  try {
    const reply = await createQuestion({
      id_student: student.id,
      id_lesson: lesson.id,
      id_question: question.id,
      id_top_question: question.id_top_question || question.id,
      title,
      message,
    });

    return res.status(200).send(new SerializeQuestions(reply).adapt());
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

const findQuestionsController = async (req, res, next) => {
  const {
    lesson: { id: id_lesson },
  } = req;
  try {
    const questions = await findAllQuestions({
      id_lesson,
      id_top_question: null,
    });

    return res.status(200).send(new ResolveDeepNesting(questions).adapt());
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

module.exports = {
  createQuestionController,
  updateQuestionController,
  deleteQuestionController,
  replyQuestionController,
  findQuestionsController,
};
