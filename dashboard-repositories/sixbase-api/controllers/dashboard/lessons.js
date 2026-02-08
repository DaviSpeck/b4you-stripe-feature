const { Op } = require('sequelize');
const YouTube = require('youtube-node');
const { promisify } = require('util');
const lodash = require('lodash');
// const VideoManager = require('../../services/VideoManager');
const PandaVideo = require('../../services/membership/PandaVideo');
const FileManager = require('../../services/FileManager');
const ApiError = require('../../error/ApiError');
const SerializeLesson = require('../../presentation/dashboard/lessons');
const SerializeSingleLesson = require('../../presentation/dashboard/lessons/single');
const rawData = require('../../database/rawData');
const {
  updateLesson,
  createLesson,
  findOneLesson,
  incrementOrder,
  decrementOrder,
} = require('../../database/controllers/lessons');
const {
  updateVideoInGallery,
} = require('../../database/controllers/product_gallery');
const {
  deleteLessonAttachmentByID,
  findAllAttachments,
} = require('../../database/controllers/lessons_attachments');
const {
  createLessonAttachment,
} = require('../../database/controllers/lessons_attachments');
// const { updateProduct } = require('../../database/controllers/products');
const { deleteLessonAndAttachments } = require('./common');
const {
  createProductGallery,
} = require('../../database/controllers/product_gallery');
const { findAllModules } = require('../../database/controllers/modules');
const { findEmbedTypeByKey } = require('../../types/embedTypes');
const REGEX = require('../../utils/regex');
const [WAITING, , AVAILABLE] = require('../../status/videoStatus');
const { formatBytes } = require('../../presentation/common');
const Panda_folders = require('../../database/models/Panda_folders');

const getYouTubeVideoIdFromUrl = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : undefined;
};

// const resolveVideoUpload = async (
//   { title, description, size },
//   oldUri = '',
// ) => {
//   let videoData = null;
//   if (oldUri) {
//     videoData = await VideoManager.replaceVideo({
//       title,
//       description,
//       size,
//       uri: oldUri,
//     });
//   } else {
//     videoData = await VideoManager.getURLforTusUpload({
//       title,
//       description,
//       size,
//     });
//   }

//   const { upload_link, uri, link } = videoData;
//   return { upload_link, uri, link };
// };

const createLessonController = async (req, res, next) => {
  const { id_module, order, title, active } = req.body;
  const {
    user: { id: id_user },
  } = req;
  try {
    const lesson = await createLesson({
      id_user,
      id_module,
      order,
      title,
      active,
    });
    return res.status(200).send(new SerializeLesson(lesson.dataValues).adapt());
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

// const resolveFolderUri = async (product) => {
//   const {
//     folder_uri,
//     uuid: product_id,
//     id,
//     producer: { uuid: user_id },
//   } = product;
//   if (folder_uri) return folder_uri;
//   const folderData = await VideoManager.createFolder(
//     `${user_id}***${product_id}`,
//   );
//   await updateProduct(id, {
//     folder_uri: folderData.uri,
//   });
//   return folderData.uri;
// };

const resolveUploadVideoOnLesson = async (product, lesson, data) => {
  const folder = await Panda_folders.findOne({
    where: {
      id_product: product.id,
    },
  });
  let folder_uuid = null;
  if (!folder) {
    const createdFolder = await new PandaVideo().createProductFolder(
      product.uuid,
    );

    await Panda_folders.create({
      id_product: product.id,
      external_uuid: createdFolder.id,
    });
    folder_uuid = createdFolder.id;
  } else {
    folder_uuid = folder.external_uuid;
  }

  const { video_title } = data;
  const PENDING = 0;
  data.folder_id = folder_uuid;
  const { uri, upload_link, link, external_id } =
    await new PandaVideo().uploadVideo(data);

  const gallery = await createProductGallery({
    id_product: product.id,
    uri,
    upload_link,
    link,
    video_status: PENDING,
    video_uploaded: false,
    title: video_title || lesson.title,
    id_embed_type: findEmbedTypeByKey('owner_panda').id,
    external_id,
  });

  data.id_gallery = gallery.id;
};

const updateDataOnLesson = async (data, product, lesson) => {
  if (data) {
    const { video_size, id_gallery, embed_url } = data;
    if (video_size && !id_gallery) {
      await resolveUploadVideoOnLesson(product, lesson, data);
    }
    if (embed_url) {
      const { duration = 0 } = data;
      let embed_type = null;
      let thumbnail = null;

      if (REGEX.VIMEO_URL.test(embed_url))
        embed_type = findEmbedTypeByKey('vimeo').id;
      if (REGEX.YOUTUBE_URL.test(embed_url)) {
        const youTube = new YouTube();
        youTube.setKey(process.env.API_YOUTUBE_V3);
        const getYtData = promisify(youTube.getById);
        try {
          const youtubeData = await getYtData(
            getYouTubeVideoIdFromUrl(embed_url),
          );
          thumbnail = youtubeData.items[0].snippet.thumbnails.default.url;
        } catch (error) {
          thumbnail = null;
        }
        embed_type = findEmbedTypeByKey('youtube').id;
      }
      if (embed_url.includes('pandavideo.com.br'))
        embed_type = findEmbedTypeByKey('panda').id;
      const gallery = await createProductGallery({
        id_product: product.id,
        embed_url,
        title: lesson.title,
        id_embed_type: embed_type,
        video_uploaded: true,
        video_status:
          embed_type === findEmbedTypeByKey('youtube').id
            ? AVAILABLE.id
            : WAITING.id,
        duration,
        thumbnail,
      });
      data.id_gallery = gallery.id;
    }
    await updateLesson(lesson.id, data);
  }
};

const updateLessonController = async (req, res, next) => {
  const { data, selectedLesson, product } = req;
  try {
    await updateDataOnLesson(data, product, selectedLesson);
    const currentLesson = await findOneLesson({ id: selectedLesson.id });
    return res
      .status(200)
      .send(new SerializeLesson(rawData(currentLesson)).adapt());
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

const reorderLessons = async (req) => {
  const { reorderedLessons } = req;

  const promises = [];
  for (let i = 0; i < reorderedLessons.length; i += 1) {
    const updatedLesson = updateLesson(reorderedLessons[i].id, {
      order: i + 1,
    });
    promises.push(updatedLesson);
  }

  await Promise.all(promises);
};

const updateOrderController = async (req, res, next) => {
  try {
    await reorderLessons(req);
    return res.sendStatus(200);
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

const deleteAttachmentController = async (req, res, next) => {
  const {
    attachment: { id, file_key },
    selectedLesson: { id: id_lesson },
  } = req;
  try {
    const FileManagerInstance = new FileManager(process.env.BUCKET_NAME);
    await FileManagerInstance.deleteFile(file_key);
    await deleteLessonAttachmentByID(id);
    const currentLesson = await findOneLesson({ id: id_lesson });
    return res
      .status(200)
      .send(new SerializeLesson(rawData(currentLesson)).adapt());
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

const changeModuleLessonAndReorderController = async (req, res, next) => {
  const { module, lessons, index } = req;

  try {
    await incrementOrder({ order: { [Op.gt]: index }, id_module: module.id });
    await updateLesson(lessons[index].id, {
      id_module: module.id,
      order: index + 1,
    });
    await decrementOrder({
      order: {
        [Op.gt]: lessons[index].order,
      },
      id_module: lessons[index].id_module,
    });
    return res.sendStatus(200);
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

const deleteLessonController = async (req, res, next) => {
  const { selectedLesson } = req;
  try {
    selectedLesson.attachments = await findAllAttachments({
      id_lesson: selectedLesson.id,
    });
    await deleteLessonAndAttachments(selectedLesson);
    return res.sendStatus(200);
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

const confirmVideoUploadController = async (req, res, next) => {
  const { selectedLesson } = req;
  try {
    await updateVideoInGallery(
      { id: selectedLesson.id_gallery },
      { video_uploaded: true, upload_link: null },
    );
    return res.sendStatus(200);
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

const deleteLessonVideoController = async (req, res, next) => {
  const {
    params: { lesson_id },
    user: { id: id_user },
  } = req;
  try {
    const lesson = await findOneLesson({ uuid: lesson_id, id_user });
    if (!lesson) throw ApiError.badRequest('Aula não encontrada');
    await updateLesson(lesson.id, { id_gallery: null });
    return res
      .status(200)
      .send(new SerializeLesson({ ...lesson, video: null }).adapt());
  } catch (error) {
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

const findProductLessonsController = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;
  try {
    const modules = await findAllModules({ id_product });
    const lessons = modules.map(({ lesson }) => lesson).flat();
    return res
      .status(200)
      .send(new SerializeSingleLesson(rawData(lessons)).adapt());
  } catch (error) {
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

const uploadAttachmentController = async (req, res, next) => {
  const {
    params: { lesson_uuid },
    body: { key, filename, file_size },
    user: { id: id_user },
  } = req;
  try {
    const lesson = await findOneLesson({ uuid: lesson_uuid });
    if (!lesson) throw ApiError.badRequest('Aula não enconmtrada');
    const attachment = await createLessonAttachment({
      id_lesson: lesson.id,
      original_name: filename,
      file: `https://arquivos-mango5.s3.sa-east-1.amazonaws.com/${key}`,
      file_key: key,
      id_user,
      file_size,
      file_extension: lodash.last(filename.split('.')),
    });
    return res.status(200).send({
      uuid: attachment.uuid,
      original_name: attachment.original_name,
      file_size: formatBytes(attachment.file_size, 0),
      file_extension: attachment.file_extension,
    });
  } catch (error) {
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

module.exports = {
  changeModuleLessonAndReorderController,
  confirmVideoUploadController,
  createLessonController,
  deleteAttachmentController,
  deleteLessonController,
  deleteLessonVideoController,
  findProductLessonsController,
  updateLessonController,
  updateOrderController,
  uploadAttachmentController,
};
