const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const {
  updateClassroom,
  findOneClassroom,
} = require('../../database/controllers/classrooms');
const {
  findAllStudentProducts,
} = require('../../database/controllers/student_products');
const {
  findAllProductOffers,
} = require('../../database/controllers/product_offer');
const { findAllModules } = require('../../database/controllers/modules');

const isThereAnyOffer = async (req, res, next) => {
  const {
    selectedClassroom: { id: id_classroom },
  } = req;
  try {
    const offers = await findAllProductOffers({ id_classroom });
    if (offers.length > 0)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Existem ofertas ativas utilizando esta turma',
        }),
      );
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

const isThereAnyStudents = async (req, res, next) => {
  const { selectedClassroom } = req;
  try {
    const students = await findAllStudentProducts({
      id_classroom: selectedClassroom.id,
    });
    if (students.length > 0)
      return next(
        ApiError.badRequest({
          success: false,
          message:
            'Você precisa mover os alunos antes de excluir a sala de aula',
        }),
      );

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

const findDefaultClassroom = async (req, res, next) => {
  const {
    product: { id },
  } = req;
  const defaultClassroom = await findOneClassroom({
    id_product: id,
    is_default: true,
  });
  req.defaultClassroom = defaultClassroom;
  return next();
};

const findSelectedClassroom =
  (parameterName = 'classroom_id', outputName = 'selectedClassroom') =>
  async (req, res, next) => {
    const classroom_id = req.params[parameterName];
    const classroom = await findOneClassroom({ uuid: classroom_id });
    if (!classroom)
      return next(ApiError.badRequest('Sala de aula não encontrada'));
    req[outputName] = classroom;
    return next();
  };

const unmarkDefaultClassroom = async (req, next) => {
  const { defaultClassroom } = req;
  const { is_default } = req.body;
  if (is_default && defaultClassroom) {
    try {
      await updateClassroom(defaultClassroom.id, { is_default: false });
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
  }

  return true;
};

const validateUpdateClassroom = async (req, res, next) => {
  const {
    selectedClassroom,
    defaultClassroom,
    product: { id: id_product },
  } = req;

  const { label, is_default, modules_ids } = req.body;
  let selectedModules = [];
  if (modules_ids && modules_ids.length > 0) {
    const modules = await findAllModules({ id_product });
    selectedModules = modules_ids.map((m) => {
      const selectedModule = modules.find(({ uuid }) => uuid === m);
      if (!selectedModule)
        return next(
          ApiError.badRequest({
            success: false,
            message: 'Módulo não encontrado',
          }),
        );
      return selectedModule;
    });
  }
  req.selectedModules = selectedModules;
  await unmarkDefaultClassroom(req, next);
  if (defaultClassroom.id === selectedClassroom.id && !is_default) {
    const nextDefaultClassroom = await findOneClassroom({
      id: {
        [Op.ne]: defaultClassroom.id,
      },
      id_product,
    });

    if (!nextDefaultClassroom) {
      await updateClassroom(defaultClassroom.id, { is_default: true });
      req.data = {
        is_default: true,
      };
    } else {
      await updateClassroom(nextDefaultClassroom.id, { is_default: true });
    }
  }

  req.data = {
    label,
    is_default,
    ...req.data,
  };
  req.id_classroom = selectedClassroom.id;
  req.selectedClassroom = selectedClassroom;
  return next();
};

const validateCreateClassroom = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;
  const { label, is_default } = req.body;
  await unmarkDefaultClassroom(req, next);
  req.data = {
    label,
    is_default,
    id_product,
  };

  return next();
};

module.exports = {
  findDefaultClassroom,
  validateCreateClassroom,
  findSelectedClassroom,
  validateUpdateClassroom,
  isThereAnyStudents,
  isThereAnyOffer,
};
