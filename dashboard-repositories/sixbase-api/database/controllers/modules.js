const Modules = require('../models/Modules');

const createModule = async (moduleObj, t = null) => {
  try {
    const module = await Modules.create(
      moduleObj,
      t
        ? {
            transaction: t,
          }
        : null,
    );
    return module;
  } catch (error) {
    throw error;
  }
};

const findOneModule = async (where) => {
  try {
    const module = await Modules.findOne({
      raw: true,
      where,
      order: [['order', 'desc']],
    });

    return module;
  } catch (error) {
    throw error;
  }
};

const updateModule = async (id, moduleObj) => {
  try {
    const module = await Modules.update(moduleObj, {
      where: {
        id,
      },
    });

    return module;
  } catch (error) {
    throw error;
  }
};

const deleteModule = async (where) => {
  const deletedModule = await Modules.destroy({
    where,
  });
  return deletedModule;
};

const decrementOrder = async (where) => {
  const module = await Modules.decrement('order', { where });
  return module;
};

const findAllModules = async (where) =>
  Modules.findAll({
    where,
    include: [
      {
        association: 'classrooms',
      },
      {
        association: 'lesson',
      },
    ],
  });

const findAllModulesWithLessonsAndVideos = async (where) =>
  Modules.findAll({
    where,
    include: [
      {
        association: 'classrooms',
      },
      {
        association: 'lesson',
        include: [
          {
            association: 'video',
          },
          {
            association: 'attachments',
          },
        ],
      },
    ],
  });

module.exports = {
  createModule,
  findOneModule,
  updateModule,
  deleteModule,
  decrementOrder,
  findAllModules,
  findAllModulesWithLessonsAndVideos,
};
