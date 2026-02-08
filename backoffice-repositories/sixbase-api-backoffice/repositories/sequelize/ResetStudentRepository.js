const ResetStudent = require('../../database/models/ResetStudent');

module.exports = class StudentRepository {
  static async findResetRequestByIdStudent(id_student) {
    const reset = await ResetStudent.findOne({
      where: {
        id_student,
      },
    });
    if (!reset) return null;
    return reset.toJSON();
  }

  static async createResetStudentPassword(resetObject) {
    const reset = await ResetStudent.create(resetObject);
    return reset.toJSON();
  }
};
