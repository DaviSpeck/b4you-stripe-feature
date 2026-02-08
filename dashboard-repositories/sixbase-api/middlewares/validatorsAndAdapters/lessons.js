const ApiError = require('../../error/ApiError');
const { findOneLesson } = require('../../database/controllers/lessons');
const { resolveKeys } = require('./common');
const {
  findAllAttachments,
} = require('../../database/controllers/lessons_attachments');
const {
  findOneVideoGallery,
} = require('../../database/controllers/product_gallery');

const validateCreateLesson = async (req, res, next) => {
  const {
    user: { id: id_user },
    module: { id: id_module },
  } = req;

  try {
    const lesson = await findOneLesson({ id_user, id_module });
    req.body.id_module = id_module;
    req.body.order = lesson ? lesson.order + 1 : 1;
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

  return next();
};

const validateUpdateLesson = async (req, res, next) => {
  const { product } = req;
  const { gallery_video } = req.body;
  try {
    const keys = Object.keys(req.body);
    if (keys.length === 0 && !req.files)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'empty body and no files sent',
        }),
      );

    if (keys.length > 0) {
      req.data = resolveKeys(req.body, keys);
      if (gallery_video) {
        const selectedVideo = await findOneVideoGallery({
          uuid: gallery_video,
          id_product: product.id,
        });
        if (!selectedVideo)
          return next(
            ApiError.badRequest({
              success: false,
              message: 'Galeria de vídeos não encontrada',
            }),
          );
        req.data.id_gallery = selectedVideo.id;
      }
    }
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

const validateUpdateOrder = async (req, res, next) => {
  const { lessons } = req;
  const { lessons_ids } = req.body;

  if (lessons.length !== lessons_ids.length)
    return next(
      ApiError.badRequest({
        success: false,
        message: 'Você deve fornecer um array com a mesma duração das aulas',
      }),
    );
  const reorderedLessons = lessons_ids.map((uuid) => {
    const lesson = lessons.find((m) => m.uuid === uuid);
    if (!lesson)
      return next(
        ApiError.badRequest({ success: false, message: 'Aula não encontrada' }),
      );
    return lesson;
  });

  req.reorderedLessons = reorderedLessons;
  return next();
};

const validateLessonAttachment = async (req, res, next) => {
  const { selectedLesson } = req;
  const { attachment_id } = req.params;
  const attachments = await findAllAttachments({
    id_lesson: selectedLesson.id,
  });
  const attachment = attachments.find(({ uuid }) => uuid === attachment_id);
  if (!attachment)
    return next(
      ApiError.badRequest({ success: false, message: 'Anexo não encontrado' }),
    );

  req.attachment = attachment;
  return next();
};

const validateLesson = async (req, res, next) => {
  const { lesson_id } = req.params;
  const {
    product: { module },
  } = req;

  const lessons = module.map(({ lesson }) => lesson).flat();
  const lesson = lessons.find(({ uuid }) => uuid === lesson_id);
  if (!lesson)
    return next(
      ApiError.badRequest({ success: false, message: 'Aula não encontrada' }),
    );

  req.lesson = lesson;
  return next();
};

const findAndOrderProductLessons = async (req, res, next) => {
  const {
    module: { lesson },
  } = req;
  const sortedLessons = lesson.sort((a, b) => a.order - b.order);
  req.lessons = sortedLessons;
  return next();
};

const findLessonsByUUID = async (req, res, next) => {
  const { lessons_ids } = req.body;
  const { module, modules } = req;

  const lessons = modules.map(({ lesson }) => lesson).flat();
  const selectedLessons = lessons_ids.map((id) => {
    const lesson = lessons.find(({ uuid }) => uuid === id);
    if (!lesson)
      return next(
        ApiError.badRequest({ success: false, message: 'Aula não encontrada' }),
      );
    return lesson;
  });

  const differentLessonIndex = selectedLessons.findIndex(
    ({ id_module }) => id_module !== module.id,
  );
  if (differentLessonIndex === -1)
    return next(
      ApiError.badRequest({
        success: false,
        message: 'Não conseguimos encontrar uma aula com um módulo diferente',
      }),
    );
  req.index = differentLessonIndex;
  req.lessons = selectedLessons;
  return next();
};

const findLessonAttachmentFromProduct = async (req, res, next) => {
  const {
    product: { module },
  } = req;
  const { attachment_id } = req.params;

  const lessons = module.map(({ lesson }) => lesson).flat();
  const lessonsAttachments = lessons
    .map(({ attachments }) => attachments)
    .flat();
  const attachment = lessonsAttachments.find(
    ({ uuid }) => uuid === attachment_id,
  );
  if (!attachment)
    return next(
      ApiError.badRequest({ success: false, message: 'Anexo não encontrado' }),
    );
  req.attachment = attachment;
  return next();
};

module.exports = {
  validateCreateLesson,
  validateUpdateLesson,
  validateUpdateOrder,
  validateLessonAttachment,
  validateLesson,
  findAndOrderProductLessons,
  findLessonsByUUID,
  findLessonAttachmentFromProduct,
};
