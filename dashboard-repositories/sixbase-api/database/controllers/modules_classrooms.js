const Module_Classroom = require('../models/Modules_Classrooms');

const createModuleClassroom = async (data) => {
  const moduleClassroom = await Module_Classroom.create(data);
  return moduleClassroom;
};

const deleteModuleClassroom = async (where) => {
  const moduleClassroom = await Module_Classroom.destroy({ where });
  return moduleClassroom;
};

module.exports = {
  createModuleClassroom,
  deleteModuleClassroom,
};
