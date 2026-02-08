const ApiError = require('../../error/ApiError');
const Encrypter = require('../../utils/helpers/encrypter');
const { validateBody, resolveKeys } = require('./common');

const validateUserPassword = async (req, res, next) => {
  const { password } = req.body;
  const {
    user: { password: currentPassword },
  } = req;
  const isValid = await Encrypter.compare(password, currentPassword);
  if (!isValid)
    return next(
      ApiError.badRequest({
        success: false,
        message: 'Senha inválida',
      }),
    );
  return next();
};

const validateBodyData = async (req, res, next) => {
  try {
    const keys = await validateBody(req.body, next);
    const data = resolveKeys(req.body, keys);
    req.data = data;
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
  validateUserPassword,
  validateBodyData,
};
