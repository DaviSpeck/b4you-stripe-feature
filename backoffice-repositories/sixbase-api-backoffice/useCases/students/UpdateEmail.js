const {
  findStudent,
  updateStudent,
} = require('../../database/controllers/students');
const ApiError = require('../../error/ApiError');

module.exports = class {
  constructor({ student_uuid, new_email }) {
    this.student_uuid = student_uuid;
    this.new_email = new_email;
  }

  async execute() {
    const student = await findStudent({
      uuid: this.student_uuid,
    });

    if (!student) throw ApiError.badRequest('Estudante não encontrado');

    await updateStudent(student.id, {
      email: this.new_email,
    });

    return student;
  }
};
