const ResetStudent = require('../models/ResetStudent');
const Students = require('../models/Students');

const createResetStudentPassword = async (resetObject, t = null) => {
  const reset = await ResetStudent.create(
    resetObject,
    t
      ? {
          transaction: t,
        }
      : null,
  );
  return reset;
};

const findResetStudentByUUID = async (uuid) => {
  const reset = await ResetStudent.findOne({
    raw: true,
    nest: true,
    where: {
      uuid,
    },
    include: [
      {
        model: Students,
        as: 'student',
      },
    ],
  });

  return reset;
};

const deleteResetRequest = async (id) => {
  const deleted = await ResetStudent.destroy({
    where: {
      id,
    },
  });
  return deleted;
};

const findResetRequestByIdStudent = async (id_student) => {
  const reset = await ResetStudent.findOne({
    where: {
      id_student,
    },
  });
  return reset;
};

module.exports = {
  createResetStudentPassword,
  deleteResetRequest,
  findResetRequestByIdStudent,
  findResetStudentByUUID,
};
