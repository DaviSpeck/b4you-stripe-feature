const Lessons = require('../models/Lessons');
const Lessons_attachments = require('../models/Lessons_attachments');
const Modules = require('../models/Modules');
const Products_gallery = require('../models/Product_gallery');

const createLesson = async (lessonObj, t = null) => {
  try {
    const lesson = await Lessons.create(
      lessonObj,
      t
        ? {
            transaction: t,
          }
        : null,
    );
    return lesson;
  } catch (error) {
    throw error;
  }
};

const findOneLesson = async (where) => {
  const lesson = await Lessons.findOne({
    nest: true,
    where,
    include: [
      {
        model: Modules,
        as: 'module',
      },
      {
        model: Products_gallery,
        as: 'video',
      },
      {
        model: Lessons_attachments,
        as: 'attachments',
      },
    ],
    order: [['order', 'desc']],
  });

  return lesson;
};

const findOneLessonProduct = async (where) => {
  const lesson = await Lessons.findOne({
    nest: true,
    where,
    include: [
      {
        model: Modules,
        as: 'module',
        include: [{ association: 'product' }],
      },
    ],
  });

  return lesson;
};

const updateLesson = async (id, lessonObj, t = null) => {
  const lesson = await Lessons.update(
    lessonObj,
    {
      where: {
        id,
      },
    },
    t
      ? {
          transaction: t,
        }
      : null,
  );
  return lesson;
};

const updateLessonWhere = async (where, lessonObj, t = null) => {
  const lesson = await Lessons.update(
    lessonObj,
    {
      where,
    },
    t
      ? {
          transaction: t,
        }
      : null,
  );
  return lesson;
};

const incrementOrder = async (where) => {
  const lesson = await Lessons.increment('order', { where });
  return lesson;
};

const decrementOrder = async (where) => {
  const lesson = await Lessons.decrement('order', { where });
  return lesson;
};

const findAllLessons = async (where) => {
  const lessons = await Lessons.findAll({
    raw: true,
    where,
  });
  return lessons;
};

const deleteLesson = async (where) => {
  const deletedLesson = await Lessons.destroy({
    where,
  });
  return deletedLesson;
};

module.exports = {
  createLesson,
  decrementOrder,
  deleteLesson,
  findAllLessons,
  findOneLesson,
  findOneLessonProduct,
  incrementOrder,
  updateLesson,
  updateLessonWhere,
};
