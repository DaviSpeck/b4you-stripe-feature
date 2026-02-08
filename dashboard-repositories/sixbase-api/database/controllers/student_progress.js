const Student_progress = require('../models/Student_progress');

const createStudentProgress = async (studentProgressObj, t = null) => {
  const student_progress = await Student_progress.create(
    studentProgressObj,
    t
      ? {
          transaction: t,
        }
      : null,
  );
  return student_progress;
};

const findOneStudentProgress = async (id_student, id_product) => {
  const student_progress = await Student_progress.findOne({
    raw: true,
    where: {
      id_student,
      id_product,
    },
  });
  return student_progress;
};

module.exports = {
  createStudentProgress,
  findOneStudentProgress,
};
