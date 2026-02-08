const ApiError = require('../../error/ApiError');
const VideoManager = require('../../services/VideoManager');
const PandaVideo = require('../../services/membership/PandaVideo');
const SerializeGallery = require('../../presentation/dashboard/productsGallery');
const {
  createProductGallery,
  deleteVideoFromGallery,
  findAllVideosInGalleryWithLessons,
  updateVideoInGallery,
  findOneVideoGallery,
} = require('../../database/controllers/product_gallery');
const {
  updateLesson,
  updateLessonWhere,
  findOneLesson,
} = require('../../database/controllers/lessons');
const [PENDING] = require('../../status/videoStatus');
const Panda_folders = require('../../database/models/Panda_folders');
const { findEmbedTypeByKey } = require('../../types/embedTypes');

const findProductGalleryController = async (req, res, next) => {
  const { product } = req;

  try {
    const where = {
      id_product: product.id,
    };
    const videosInGallery = await findAllVideosInGalleryWithLessons(where);
    return res.status(200).send(new SerializeGallery(videosInGallery).adapt());
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

const uploadVideosOnGalleryController = async (req, res, next) => {
  const {
    product: { id: id_product, uuid: uuid_product },
    body: { gallery },
  } = req;

  try {
    const folder = await Panda_folders.findOne({
      where: {
        id_product,
      },
    });
    let folder_uuid = null;
    if (!folder) {
      const createdFolder = await new PandaVideo().createProductFolder(
        uuid_product,
      );

      await Panda_folders.create({
        id_product,
        external_uuid: createdFolder.id,
      });
      folder_uuid = createdFolder.id;
    } else {
      folder_uuid = folder.external_uuid;
    }

    const promises = [];
    gallery.forEach(({ title, video_size }) => {
      promises.push(
        new PandaVideo().uploadVideo({
          video_size,
          video_title: title,
          folder_id: folder_uuid,
        }),
      );
    });
    const uploadedVideos = await Promise.all(promises);
    const galleryPromise = [];
    uploadedVideos.forEach(({ upload_link, uri, link, title, external_id }) => {
      galleryPromise.push(
        createProductGallery({
          id_product,
          upload_link,
          uri,
          link,
          title,
          video_status: PENDING.id,
          video_uploaded: false,
          id_embed_type: findEmbedTypeByKey('owner_panda').id,
          external_id,
        }),
      );
    });
    const galleryItems = await Promise.all(galleryPromise);
    return res.status(200).send(new SerializeGallery(galleryItems).adapt());
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

const deleteVideoFromGalleryController = async (req, res, next) => {
  const {
    params: { video_id },
  } = req;
  try {
    const video = await findOneVideoGallery({
      uuid: video_id,
    });
    if (!video) throw ApiError.badRequest('Video não encontrado');

    const { id, uri } = video;
    if (Number(video.id_embed_type) !== findEmbedTypeByKey('owner_panda').id) {
      await VideoManager.deleteVideo(uri);
    } else {
      await new PandaVideo().deleteVideo(video.external_id);
    }
    await deleteVideoFromGallery({ id });
    const lesson = await findOneLesson({ id_gallery: id });
    if (lesson) await updateLesson(lesson.id, { id_gallery: null });
    return res.sendStatus(200);
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

const confirmVideoUploadController = async (req, res, next) => {
  const {
    body: { video_id },
  } = req;

  try {
    await updateVideoInGallery(
      { uuid: video_id },
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

const updateVideoFromGalleryController = async (req, res, next) => {
  const {
    body: { title, lesson_id },
    params: { video_id },
  } = req;
  try {
    const video = await findOneVideoGallery({ uuid: video_id });
    if (!video) throw ApiError.badRequest('Video não encontrado');
    if (title) {
      await updateVideoInGallery({ id: video.id }, { title });
    }
    const lesson = await findOneLesson({ uuid: lesson_id });
    if (lesson) {
      await updateLessonWhere({ id_gallery: video.id }, { id_gallery: null });
      await updateLesson(lesson.id, { id_gallery: video.id });
    }
    return res.sendStatus(200);
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

const uploadSingleVideoOnGalleryController = async (req, res, next) => {
  const {
    product: { id: id_product, uuid: uuid_product },
    body: { title, video_size },
  } = req;

  try {
    const folder = await Panda_folders.findOne({
      where: {
        id_product,
      },
    });
    let folder_uuid = null;
    if (!folder) {
      const createdFolder = await new PandaVideo().createProductFolder(
        uuid_product,
      );

      await Panda_folders.create({
        id_product,
        external_uuid: createdFolder.id,
      });
      folder_uuid = createdFolder.id;
    } else {
      folder_uuid = folder.external_uuid;
    }

    const { uri, upload_link, link, external_id } =
      await new PandaVideo().uploadVideo({
        video_size,
        video_title: title,
        folder_id: folder_uuid,
      });

    const gallery = await createProductGallery({
      id_product,
      upload_link,
      uri,
      link,
      title,
      video_status: PENDING.id,
      video_uploaded: false,
      id_embed_type: findEmbedTypeByKey('owner_panda').id,
      external_id,
    });
    return res.status(200).send(new SerializeGallery(gallery).adapt());
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

const removeVideoFromGalleryController = async (req, res, next) => {
  const {
    params: { video_id },
  } = req;
  try {
    const video = await findOneVideoGallery({ uuid: video_id });
    if (!video) throw ApiError.badRequest('Video não encontrado');
    const { id, uri } = video;
    await VideoManager.deleteVideo(uri);
    await updateVideoInGallery(
      { id },
      {
        duration: 0,
        link: null,
        thumbnail: null,
        upload_link: null,
        uri: null,
        video_status: 0,
        video_uploaded: false,
      },
    );
    return res.sendStatus(200);
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
  deleteVideoFromGalleryController,
  findProductGalleryController,
  removeVideoFromGalleryController,
  updateVideoFromGalleryController,
  uploadSingleVideoOnGalleryController,
  uploadVideosOnGalleryController,
  confirmVideoUploadController,
};
