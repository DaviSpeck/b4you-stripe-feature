const ApiError = require('../../../error/ApiError');
const {
  findStudentByEmail,
  createStudent,
} = require('../../../database/controllers/students');
const {
  createResetStudentPassword,
} = require('../../../database/controllers/resetStudent');
const { generateRandomPassword } = require('../../../utils/generators');

module.exports = class CreateStudent {
  constructor(
    { full_name, email, document_number, whatsapp },
    dbTransaction = null,
  ) {
    this.full_name = full_name;
    this.email = email;
    this.document_number = document_number;
    this.whatsapp = whatsapp;
    this.dbTransaction = dbTransaction;
  }

  async execute() {
    const isThereAStudent = await findStudentByEmail(this.email);
    if (isThereAStudent) throw ApiError.badRequest('Aluno já matriculado');
    const student = await createStudent(
      {
        full_name: this.full_name,
        email: this.email,
        document_number: this.document_number,
        whatsapp: this.whatsapp,
        password: generateRandomPassword(),
        status: 'pending',
        document_type: 'CPF',
      },
      this.dbTransaction,
    );
    const resetToken = await createResetStudentPassword({
      id_student: student.id,
    });
    return {
      student,
      resetToken,
    };
  }
};
