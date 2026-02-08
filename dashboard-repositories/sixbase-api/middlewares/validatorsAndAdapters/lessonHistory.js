const ApiError = require('../../error/ApiError');
const { findOneLesson } = require('../../database/controllers/lessons');
const {
  createLessonHistory,
  findLessonHistory,
} = require('../../database/controllers/lessonHistory');

const validateLessonHistory = async (req, res, next) => {
  const { lesson_id: uuid, ...rest } = req.body;
  const {
    student: { id: id_student },
  } = req;

  if (Object.keys(rest).length === 0)
    return next(ApiError.badRequest({ success: false, message: 'Empty body' }));

  try {
    const lesson = await findOneLesson({
      uuid,
    });

    if (!lesson)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Aula não encontrada com a identificação informada',
        }),
      );
    let history = await findLessonHistory({
      id_student,
      id_lesson: lesson.id,
    });

    if (!history) {
      history = await createLessonHistory({
        id_student,
        id_product: lesson.module.id_product,
        id_module: lesson.id_module,
        id_lesson: lesson.id,
      });
    }

    req.history = history;
    req.data = { ...rest, id_product: lesson.id_product };
    return next();
  } catch (error) {
    console.log('error lesson', error);
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
  validateLessonHistory,
};
