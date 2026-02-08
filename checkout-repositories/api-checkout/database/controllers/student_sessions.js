const Students = require('../models/Students');
const Student_sessions = require('../models/Student_sessions');

const createStudentSession = async (data) => Student_sessions.create(data);

const deleteStudentSession = async (where) =>
  Student_sessions.destroy({ where });

const findStudentSession = async (where) => {
  const studentSession = await Student_sessions.findOne({
    nest: true,
    raw: true,
    include: [
      {
        model: Students,
        as: 'student',
      },
    ],
    where,
  });

  return studentSession;
};

module.exports = {
  createStudentSession,
  deleteStudentSession,
  findStudentSession,
};
