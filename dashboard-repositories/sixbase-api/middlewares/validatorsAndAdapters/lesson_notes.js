const ApiError = require('../../error/ApiError');
const { findOneLessonProduct } = require('../../database/controllers/lessons');
const {
  findSingleStudentProduct,
} = require('../../database/controllers/student_products');

module.exports.findLessonProduct = async (req, res, next) => {
  const {
    student: { id: id_student },
    params: { lesson_id: uuid },
  } = req;
  try {
    const lesson = await findOneLessonProduct({
      uuid,
    });
    if (!lesson || !lesson.module)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Aula não encontrada',
        }),
      );
    const studentProduct = await findSingleStudentProduct({
      id_student,
      id_product: lesson.module.id_product,
    });
    if (!studentProduct)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Produto não encontrado',
        }),
      );
    lesson.id_product = lesson.module.id_product;
    req.lesson = { id: lesson.id, id_product: lesson.module.id_product };
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
