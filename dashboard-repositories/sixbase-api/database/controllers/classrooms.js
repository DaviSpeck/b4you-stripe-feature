const Classrooms = require('../models/Classrooms');

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
        association: 'modules',
        attributes: ['uuid', 'title', 'cover'],
        include: [
          {
            association: 'lesson',
            attributes: ['id'],
          },
        ],
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
