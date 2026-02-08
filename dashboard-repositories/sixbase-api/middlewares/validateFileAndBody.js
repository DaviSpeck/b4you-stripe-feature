const ApiError = require('../error/ApiError');

const validateFileAndBody = async (req, res, next) => {
  try {
    const body = JSON.parse(req.body.data);
    req.body = body;
    return next();
  } catch (error) {
    return next(
      ApiError.badRequest({
        success: false,
        message: 'Erro ao converter body',
      }),
    );
  }
};

module.exports = validateFileAndBody;
