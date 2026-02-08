const { Op } = require('sequelize');
const fs = require('fs');
const SerializeModule = require('../../presentation/dashboard/modules');
const ApiError = require('../../error/ApiError');
const Image = require('../../utils/helpers/images');
const {
  createModule,
  updateModule,
  deleteModule,
  decrementOrder,
  findAllModulesWithLessonsAndVideos,
} = require('../../database/controllers/modules');
const {
  createModuleClassroom,
  deleteModuleClassroom,
} = require('../../database/controllers/modules_classrooms');
const { deleteLessonAndAttachments } = require('./common');
const {
  findAllAttachments,
} = require('../../database/controllers/lessons_attachments');
const { resolveImageFromBuffer } = require('../../utils/files');
const FileManager = require('../../services/FileManager');

const createModuleController = async (req, res, next) => {
  const { data, classrooms, file } = req;
  try {
    if (file) {
      const fileBuffer = await Image.formatImageLogo(
        file.path,
        Image.CONFIG.MODULE_COVER,
      );
      const { file: url, key } = await resolveImageFromBuffer(
        fileBuffer,
        file.key,
      );
      fs.unlinkSync(file.path);
      data.cover = url;
      data.cover_key = key;
    }
    const module = await createModule(data);
    module.classrooms = [];
    if (classrooms.length > 0) {
      const promises = [];
      classrooms.forEach((classroom) => {
        promises.push(
          createModuleClassroom({
            id_classroom: classroom.id,
            id_module: module.id,
          }),
        );
      });
      await Promise.all(promises);
      module.classrooms = classrooms;
    }

    return res.status(200).send(new SerializeModule(module).adapt());
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

const findModulesController = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;
  try {
    const modules = await findAllModulesWithLessonsAndVideos({ id_product });
    const sortedModules = modules.sort((a, b) => a.order - b.order);
    return res.status(200).send(new SerializeModule(sortedModules).adapt());
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

const reorderModules = async (req) => {
  const { reorderedModules } = req;

  const promises = [];
  for (let i = 0; i < reorderedModules.length; i += 1) {
    const updatedModule = updateModule(reorderedModules[i].id, {
      order: i + 1,
    });
    promises.push(updatedModule);
  }

  await Promise.all(promises);
};

const reorderModulesController = async (req, res, next) => {
  try {
    await reorderModules(req);
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

const unmarkClassrooms = async (classrooms, id_module) => {
  const ids = classrooms.map(({ id }) => id);
  await deleteModuleClassroom({ id_classroom: ids, id_module });
};

const updateModuleController = async (req, res, next) => {
  const { module, data, selectedClassrooms } = req;
  try {
    await updateModule(module.id, data);
    if (selectedClassrooms.length >= 0) {
      await unmarkClassrooms(module.classrooms, module.id);
      const promises = [];
      selectedClassrooms.forEach((classroom) => {
        promises.push(
          createModuleClassroom({
            id_classroom: classroom.id,
            id_module: module.id,
          }),
        );
      });
      await Promise.all(promises);
    }
    return res.status(200).send({ sucess: true, message: 'Módulo atualizado' });
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

const deleteModuleController = async (req, res, next) => {
  const { module } = req;
  try {
    if (module.lesson.length > 0) {
      const promises = [];
      for await (const lesson of module.lesson) {
        lesson.attachments = await findAllAttachments({ id_lesson: lesson.id });
        promises.push(deleteLessonAndAttachments(lesson));
      }
      await Promise.all(promises);
    }
    await deleteModule({ id: module.id });
    await decrementOrder({
      order: {
        [Op.gte]: module.order,
      },
      id_product: module.id_product,
      deleted_at: null,
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

const uploadModuleCoverController = async (req, res, next) => {
  const { file, module } = req;
  try {
    const fileBuffer = await Image.formatImageLogo(
      file.path,
      Image.CONFIG.MODULE_COVER,
    );
    const { file: url, key } = await resolveImageFromBuffer(
      fileBuffer,
      file.key,
    );
    fs.unlinkSync(file.path);
    if (module.cover_key) {
      const FileManagerInstance = new FileManager(process.env.BUCKET_NAME);
      await FileManagerInstance.deleteFile(module.cover_key);
    }
    await updateModule(module.id, { cover: url, cover_key: key });
    return res.status(200).send({ url });
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

const deleteModuleCoverController = async (req, res, next) => {
  const { module } = req;
  try {
    if (module.cover_key) {
      const FileManagerInstance = new FileManager(process.env.BUCKET_NAME);
      await FileManagerInstance.deleteFile(module.cover_key);
      await updateModule(module.id, { cover: null, cover_key: null });
    }
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

module.exports = {
  createModuleController,
  deleteModuleController,
  deleteModuleCoverController,
  findModulesController,
  reorderModulesController,
  updateModuleController,
  uploadModuleCoverController,
};
