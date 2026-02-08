const ApiError = require('../../error/ApiError');

const validMimeType = (mimetype, mimeTypes) => mimeTypes.includes(mimetype);

const invalidMimeType = (mimetype, invalidMimeTypes) =>
  validMimeType(mimetype, invalidMimeTypes);

const invalidFileFIlter = (invalidMimeTypes) => async (req, file, cb) => {
  if (invalidMimeType(file.mimetype, invalidMimeTypes)) {
    return cb(ApiError.badRequest('Tipo de arquivo inválido'));
  }
  return cb(null, true);
};

const validFileFilter = (validMimeTypes) => async (req, file, cb) => {
  if (validMimeType(file.mimetype, validMimeTypes)) {
    return cb(null, true);
  }
  return cb(ApiError.badRequest('Tipo de arquivo inválido'));
};

module.exports = {
  validFileFilter,
  invalidFileFIlter,
};
