const ApiError = require('../../error/ApiError');
const {
  findMutedStudent,
} = require('../../database/controllers/mute_students');

const verifyMutedStudent = async (req, res, next) => {
  const {
    product: { id: id_product },
    student: { id: id_student },
  } = req;

  try {
    const muted = await findMutedStudent({ id_student, id_product });
    if (muted)
      return next(
        ApiError.badRequest({ success: false, message: 'Aluno silenciado' }),
      );

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

module.exports = {
  verifyMutedStudent,
};
