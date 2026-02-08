const { findUserByEmail } = require('../database/controllers/users');
const ApiError = require('../error/ApiError');
const Token = require('../utils/helpers/token');

module.exports = async (req, res, next) => {
  const { user, owner } = req.session;
  const { authorization } = req.headers;
  if (authorization) {
    const tokens = authorization.split('Bearer ');
    if (tokens.length > 1) {
      const token = tokens[1];
      const isValid = Token.verify(token);
      if (!isValid) {
        return next(ApiError.unauthorized());
      }

      const { email } = isValid;
      const currentUser = await findUserByEmail(email);
      if (!currentUser) {
        return next(ApiError.unauthorized());
      }
      if (!currentUser.active) {
        return next(ApiError.unauthorized());
      }
      req.user = currentUser;
      req.owner = currentUser;
      return next();
    }
    return next(ApiError.unauthorized());
  }
  if (!user) {
    return next(ApiError.unauthorized());
  }
  if (!user.active) {
    return next(ApiError.unauthorized());
  }
  req.user = user;
  req.owner = owner;
  return next();
};
