const ApiError = require('../../error/ApiError');
const ForgotPasswordEmail = require('../../services/email/student/ForgotPassword');

module.exports = class FindUserInfo {
  constructor({ StudentRepository, ResetStudentRepository }) {
    this.StudentRepository = StudentRepository;
    this.ResetStudentRepository = ResetStudentRepository;
  }
  async execute(userUuid) {
    const student = await this.StudentRepository.findByUUID(userUuid);
    if (!student) throw ApiError.badRequest('Usuário não encontrado');
    let token;
    const alreadyExistsRecovery =
      await this.ResetStudentRepository.findResetRequestByIdStudent(student.id);
    if (alreadyExistsRecovery) {
      token = alreadyExistsRecovery.uuid;
    } else {
      const { uuid } =
        await this.ResetStudentRepository.createResetStudentPassword({
          id_student: student.id,
        });
      token = uuid;
    }
    await new ForgotPasswordEmail({
      full_name: student.full_name,
      token,
      email: student.email,
      url: process.env.URL_SIXBASE_MEMBERSHIP,
    }).send();
  }
};
