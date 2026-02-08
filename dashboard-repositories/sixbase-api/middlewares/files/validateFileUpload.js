const ApiError = require('../../error/ApiError');
const logger = require('../../utils/logger');

const kb = 1024;
const sizes = {
  KB: kb,
  MB: 1000 * kb,
  GB: 1000000 * kb,
};

const validateFileUpload =
  ({ maxSize, unity, fileFilter }) =>
  async (req, res, next) => {
    const {
      headers: { files_data },
    } = req;
    const allowedMaxSize = maxSize * sizes[unity];
    try {
      if (!files_data) return next();
      const filesData = JSON.parse(files_data);
      if (!Array.isArray(filesData) || filesData.length === 0) return next();
      filesData.forEach(({ type, size }) => {
        if (!type)
          throw ApiError.badRequest(
            'type precisa ser enviado no array de files_data',
          );
        if (typeof type !== 'string')
          throw ApiError.badRequest('type deve ser uma string');
        if (!size)
          throw ApiError.badRequest(
            'size precisa ser enviado no array de files_data',
          );
        if (typeof size !== 'number')
          throw ApiError.badRequest('type precisa ser do tipo inteiro');
        const isExtensionAllowed = fileFilter(type);
        if (!isExtensionAllowed)
          throw ApiError.badRequest('Extensão de arquivo não permitida');

        if (size > allowedMaxSize)
          throw ApiError.badRequest(
            `Arquivo maior que o limite: ${maxSize} ${unity}`,
          );
      });

      return next();
    } catch (error) {
      logger.error(error);
      if (error instanceof ApiError) return res.status(error.code).send(error);
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

module.exports = validateFileUpload;
