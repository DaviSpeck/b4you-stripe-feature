const { createStudent } = require('../../../database/controllers/students');
const {
  createResetStudentPassword,
} = require('../../../database/controllers/resetStudent');
const { generateRandomPassword } = require('../../../utils/generators');

module.exports = class CreateStudent {
  constructor(data, dbTransaction = null) {
    this.data = data;
    this.dbTransaction = dbTransaction;
  }

  async execute() {
    const student = await createStudent(
      {
        ...this.data,
        password: generateRandomPassword(),
        document_type: 'CPF',
        status: 'pending',
      },
      this.dbTransaction,
    );
    const resetToken = await createResetStudentPassword(
      {
        id_student: student.id,
      },
      this.dbTransaction,
    );
    return {
      student,
      resetToken,
    };
  }
};
