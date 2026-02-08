const ApiError = require('../../../error/ApiError');
const { randomFixedInteger } = require('../../../utils/generators');
const { findUserHistoryTypeByKey } = require('../../../types/userHistory');
const SecurityCode = require('../../../services/email/student/securityCode');

module.exports = class CreateCode {
  #StudentRepository;

  #EmailService;

  #UserHistoryRepository;

  constructor({ StudentRepository, EmailService, UserHistoryRepository }) {
    this.#StudentRepository = StudentRepository;
    this.#EmailService = EmailService;
    this.#UserHistoryRepository = UserHistoryRepository;
  }

  async execute({ email, ip = 'Não obtido', agent = 'Não obtido' }) {
    const student = await this.#StudentRepository.findByEmail(email);
    if (!student)
      throw ApiError.badRequest(
        'Nenhuma compra encontrada com o e-mail informado',
      );
    const userHistory = await this.#UserHistoryRepository.find({
      id_student: student.id,
      params: {
        '"success"': false,
      },
      id_type: findUserHistoryTypeByKey('code').id,
    });
    if (userHistory) {
      await this.#UserHistoryRepository.delete({ id: userHistory.id });
    }
    const data = {
      id_student: student.id,
      id_type: findUserHistoryTypeByKey('code').id,
      params: {
        ip,
        success: false,
        verification_code: randomFixedInteger(6),
        agent,
      },
    };
    await new SecurityCode(this.#EmailService).send({
      student_name: student.full_name,
      email: student.email,
      verification_code: data.params.verification_code,
    });
    await this.#UserHistoryRepository.create(data);
  }
};
