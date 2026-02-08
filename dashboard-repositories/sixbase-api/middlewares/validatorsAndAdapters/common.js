const ApiError = require('../../error/ApiError');

const validateFile = async (req, res, next) => {
  if (!req.file)
    return next(
      ApiError.badRequest({
        success: false,
        message: 'A file must be provided in form-data',
      }),
    );
  return next();
};

/**
 *
 * @param {any} body
 * @param {*} next
 * @returns keys
 */
const validateBody = async (body, next) => {
  const keys = Object.keys(body);
  if (keys.length === 0) await next(ApiError.badRequest('invalid empty body'));

  return keys;
};

const resolveKeys = (body, keys) => {
  const data = {};
  keys.forEach((key) => {
    data[key] = body[key];
  });

  return data;
};

const validateLesson = async (req, res, next) => {
  const { modules } = req;
  const { lesson_id } = req.params;

  const lessonArray = modules.map(({ lesson }) => lesson).flat();

  if (lessonArray.length === 0)
    return next(
      ApiError.badRequest({ success: false, message: 'Aula não encontrada' }),
    );

  const selectedLesson = lessonArray.find(({ uuid }) => uuid === lesson_id);
  if (!selectedLesson)
    return next(
      ApiError.badRequest({ success: false, message: 'Aula não encontrada' }),
    );

  selectedLesson.module = modules.find(
    (m) => m.id === selectedLesson.id_module,
  );

  req.selectedLesson = selectedLesson;
  return next();
};

module.exports = {
  validateLesson,
  validateFile,
  validateBody,
  resolveKeys,
};
