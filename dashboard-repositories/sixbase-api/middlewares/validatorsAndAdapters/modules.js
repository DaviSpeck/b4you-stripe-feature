const ApiError = require('../../error/ApiError');
const {
  findOneModule,
  findAllModules,
} = require('../../database/controllers/modules');
const {
  findAllClassroomsPreview,
} = require('../../database/controllers/classrooms');
const { validateBody, resolveKeys } = require('./common');

const validateCreateModule = async (req, res, next) => {
  const {
    product: { id: id_product, id_user },
  } = req;
  const { title, description, active, release, classrooms_ids } = req.body;
  try {
    const module = await findOneModule({ id_product });
    req.data = {
      title,
      description,
      active,
      release,
      order: module ? module.order + 1 : 1,
      id_product,
      id_user,
    };
    req.classrooms = [];
    if (classrooms_ids && classrooms_ids.length > 0) {
      const classrooms = await findAllClassroomsPreview({
        uuid: classrooms_ids,
        id_product,
      });
      if (classrooms.length === 0)
        return next(
          ApiError.badRequest({
            success: false,
            message: 'Sala de aula não encontrada',
          }),
        );
      req.classrooms = classrooms;
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

const findAndOrderProductModules = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;
  const modules = await findAllModules({ id_product });
  const sortedModules = modules.sort((a, b) => a.order - b.order);
  req.modules = sortedModules;
  return next();
};

const verifyModules = async (req, res, next) => {
  const { modules } = req;
  const { modules_ids } = req.body;

  if (modules.length !== modules_ids.length)
    return next(
      ApiError.badRequest({
        success: false,
        message:
          'you must provide an array with the same length as modules length',
      }),
    );
  const reorderedModules = modules_ids.map((uuid) => {
    const module = modules.find((m) => m.uuid === uuid);
    if (!module)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Módulo não encontrado',
        }),
      );
    return module;
  });

  req.reorderedModules = reorderedModules;
  return next();
};

const validateModule = async (req, res, next) => {
  const {
    product: { id: id_product },
    modules,
  } = req;
  const { classrooms_ids } = req.body;
  const { module_id } = req.params;

  const classrooms = await findAllClassroomsPreview({ id_product });

  const selectedModule = modules.find(({ uuid }) => uuid === module_id);
  if (!selectedModule)
    return next(
      ApiError.badRequest({ success: false, message: 'Módulo não encontrado' }),
    );

  let selectedClassrooms = [];
  if (classrooms_ids && classrooms_ids.length > 0) {
    selectedClassrooms = classrooms_ids.map((c) => {
      const selectedClassroom = classrooms.find(({ uuid }) => uuid === c);
      if (!selectedClassroom)
        return next(
          ApiError.badRequest({
            success: false,
            message: 'Sala de aula não encontrada',
          }),
        );
      return selectedClassroom;
    });
  }
  req.selectedClassrooms = selectedClassrooms;
  req.module = selectedModule;
  return next();
};

const validateBodyAndPrepareData = async (req, res, next) => {
  const keys = await validateBody(req.body, next);
  req.data = resolveKeys(req.body, keys);
  return next();
};

module.exports = {
  validateCreateModule,
  findAndOrderProductModules,
  verifyModules,
  validateModule,
  validateBodyAndPrepareData,
};
