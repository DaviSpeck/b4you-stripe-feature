const logger = require('../utils/logger');

class ApiError {
  constructor(code, message) {
    this.code = code;
    this.message = message;
  }

  static badRequest(message, error) {
    this.logError(error, message);
    return new ApiError(400, message);
  }

  static notFound(message, error) {
    this.logError(error, message);
    return new ApiError(404, message);
  }

  static internalServerError(message, error) {
    this.logError(error, message);
    return new ApiError(500, message);
  }

  static unauthorized() {
    return new ApiError(401, { message: 'Acesso negado' });
  }

  static forbidden() {
    return new ApiError(403, 'forbidden');
  }

  static logError(error, message) {
    if (message) logger.error(message);
    if (error) logger.error(error);
  }
}

module.exports = ApiError;
