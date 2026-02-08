const ApiError = require('../../error/ApiError');
const SerializeClassroom = require('../../presentation/dashboard/classrooms');
const SerializeClassroomPreview = require('../../presentation/dashboard/classroomsPreview');
const {
  createClassroom,
  updateClassroom,
  findOneClassroom,
  findAllClassrooms,
  deleteClassroom,
  findAllClassroomsPreview,
} = require('../../database/controllers/classrooms');
const {
  createModuleClassroom,
  deleteModuleClassroom,
} = require('../../database/controllers/modules_classrooms');
const { findAllModules } = require('../../database/controllers/modules');

const createClassroomController = async (req, res, next) => {
  const {
    data,
    product: { id: id_product },
  } = req;
  try {
    const classroom = await createClassroom(data);
    classroom.modules = await findAllModules({ id_product });
    return res.status(200).send(new SerializeClassroom(classroom).adapt());
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

const updateClassroomController = async (req, res, next) => {
  const { data, id_classroom, selectedModules, selectedClassroom } = req;
  try {
    await deleteModuleClassroom({ id_classroom: selectedClassroom.id });
    if (selectedModules.length > 0) {
      const promises = [];
      selectedModules.forEach((module) => {
        promises.push(
          createModuleClassroom({
            id_classroom,
            id_module: module.id,
          }),
        );
      });
      await Promise.all(promises);
    }
    await updateClassroom(id_classroom, data);
    const classroom = await findOneClassroom({ id: id_classroom });
    return res.status(200).send(new SerializeClassroom(classroom).adapt());
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

const findAllClassroomsController = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;
  try {
    const classrooms = await findAllClassrooms({ id_product });
    return res.status(200).send(new SerializeClassroom(classrooms).adapt());
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

const findAllClassroomsControllerPreview = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;
  try {
    const classrooms = await findAllClassroomsPreview({ id_product });
    return res
      .status(200)
      .send(new SerializeClassroomPreview(classrooms).adapt());
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

const deleteClassroomController = async (req, res, next) => {
  const {
    selectedClassroom: { id, is_default },
    product: { id: id_product },
  } = req;
  try {
    await deleteClassroom({ id });
    if (is_default) {
      const nextDefaultClassroom = await findOneClassroom({
        id_product,
      });
      await updateClassroom(nextDefaultClassroom.id, { is_default: true });
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
  createClassroomController,
  updateClassroomController,
  findAllClassroomsController,
  deleteClassroomController,
  findAllClassroomsControllerPreview,
};
