const Sequelize = require('sequelize');
const Classrooms = require('../models/Classrooms');
const Lessons = require('../models/Lessons');
const Modules = require('../models/Modules');
const Student_products = require('../models/Students_products');
const Product_offer = require('../models/Product_offer');
const Study_history = require('../models/Study_history');

const createClassroom = async (classroomObj, t = null) => {
  const classroom = await Classrooms.create(
    classroomObj,
    t
      ? {
          transaction: t,
        }
      : null,
  );
  return classroom;
};

const updateClassroom = async (id, classroomObj) => {
  const classroom = await Classrooms.update(classroomObj, {
    where: {
      id,
    },
  });
  return classroom;
};

const findOneClassroom = async (where) => {
  const classroom = await Classrooms.findOne({
    raw: true,
    where,
  });
  return classroom;
};

const findAllClassrooms = async (where) => {
  const classrooms = await Classrooms.findAll({
    nest: true,
    where,
    attributes: [
      'id',
      'label',
      'is_default',
      'uuid',
      'created_at',
      'updated_at',
    ],
    include: [
      {
        model: Modules,
        as: 'modules',
        attributes: ['uuid', 'title', 'cover'],
        include: [
          {
            model: Lessons,
            as: 'lesson',
            attributes: ['id'],
          },
        ],
      },
      {
        model: Student_products,
        as: 'student_products',
        attributes: ['id'],
        include: [
          {
            model: Study_history,
            as: 'study_history',
            attributes: ['done', 'id_lesson'],
            on: {
              col1: Sequelize.where(
                Sequelize.col('student_products.id_student'),
                '=',
                Sequelize.col('student_products->study_history.id_student'),
              ),
              col2: Sequelize.where(
                Sequelize.col('student_products.id_product'),
                '=',
                Sequelize.col('student_products->study_history.id_product'),
              ),
            },
          },
        ],
      },
      {
        model: Product_offer,
        as: 'offers',
        attributes: ['uuid', 'name'],
      },
    ],
  });
  return classrooms;
};

const findAllClassroomsPreview = async (where) => {
  const classrooms = await Classrooms.findAll({
    nest: true,
    where,
    attributes: ['id', 'label', 'is_default', 'uuid', 'created_at'],
  });
  return classrooms;
};

const deleteClassroom = async (where) =>
  Classrooms.destroy({
    where,
  });

const findClassrooms = async (where) =>
  Classrooms.findAll({ raw: true, where });

const findStudentClassroomWithModules = async (where) => {
  const { id_student, ...rest } = where;
  const classroom = await Classrooms.findOne({
    nest: true,
    where: rest,
    include: [
      {
        association: 'modules',
        include: [
          {
            association: 'lesson',
            separate: true,
            include: [
              {
                association: 'study_history',
                where: {
                  id_student,
                },
                required: false,
              },
              {
                association: 'attachments',
              },
              {
                association: 'video',
              },
            ],
          },
        ],
      },
    ],
  });
  if (classroom) return classroom.toJSON();
  return classroom;
};

const findProducerClassroom = async (where) => {
  const classroom = await Classrooms.findOne({
    where,
    include: [
      {
        association: 'modules',
        required: false,
        include: [
          {
            association: 'lesson',
            separate: true,
            required: false,
            include: [
              {
                association: 'study_history',
                where: {
                  id_student: 0,
                },
                required: false,
              },
              {
                association: 'attachments',
              },
              {
                association: 'video',
              },
            ],
          },
        ],
      },
    ],
  });

  return classroom;
};

module.exports = {
  createClassroom,
  updateClassroom,
  findOneClassroom,
  findAllClassrooms,
  deleteClassroom,
  findClassrooms,
  findStudentClassroomWithModules,
  findAllClassroomsPreview,
  findProducerClassroom,
};
