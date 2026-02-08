const ApiError = require('./ApiError');
const logger = require('../utils/logger');

// eslint-disable-next-line
const apiErrorHandler = async (err, req, res, next) => {
  // Add CORS headers for all error responses
  const { origin } = req.headers;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (err instanceof ApiError) {
    return res.status(err.code).json(err.message);
  }

  const errorLog = [
    `[UNKNOWN_API_ERROR]`,
    `req_id: ${req.id || 'N/A'}`,
    `error_code: ${err.code || 'N/A'}`,
    `error_message: ${err.message || 'N/A'}`,
    `req_method: ${req.method || 'N/A'}`,
    `req_url: ${req.originalUrl || req.url || 'N/A'}`,
    `req_baseUrl: ${req.baseUrl || 'N/A'}`,
    `req_body: ${JSON.stringify(req.body)}`,
    `req_headers: ${JSON.stringify(req.headers)}`,
    `error_stack: ${err.stack || 'N/A'}`,
    `complete_error: ${JSON.stringify(err)}`,
  ].join(' | ');

  logger.error(errorLog);
  return res.status(500).json('Something went wrong.');
};

module.exports = apiErrorHandler;
