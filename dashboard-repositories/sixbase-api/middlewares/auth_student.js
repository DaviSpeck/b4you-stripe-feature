const ApiError = require('../error/ApiError');

module.exports = async (req, res, next) => {
  const { student } = req.session;
  if (!student) {
    return next(ApiError.unauthorized());
  }
  req.student = student;
  return next();
};
