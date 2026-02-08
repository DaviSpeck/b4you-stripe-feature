const { findUserByEmail } = require('../database/controllers/users');
const ApiError = require('../error/ApiError');
const Token = require('../utils/helpers/token');

module.exports = async (req, res, next) => {
  const { headers } = req;
  if (!headers.authorization) {
    return next(ApiError.unauthorized());
  }
  try {
    const { email } = Token.verify(headers.authorization);
    const user = await findUserByEmail(email);
    if (!user) throw ApiError.unauthorized();
    req.user = user;
    req.owner = user;
    return next();
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return res.status(401).send({
      success: false,
      message: 'Acesso negado',
    });
  }
};
