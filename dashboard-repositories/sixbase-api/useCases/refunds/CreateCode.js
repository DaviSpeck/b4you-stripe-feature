const ApiError = require('../../error/ApiError');
const { randomFixedInteger } = require('../../utils/generators');
const { findUserHistoryTypeByKey } = require('../../types/userHistory');
const RefundCode = require('../../services/email/student/refundCode');

module.exports = class CreateCode {
  #UserHistoryRepository;

  #StudentRepository;

  #EmailService;

  #SalesItemsRepository;

  constructor(
    UserHistoryRepository,
    StudentRepository,
    SalesItemsRepository,
    EmailService,
  ) {
    this.#UserHistoryRepository = UserHistoryRepository;
    this.#StudentRepository = StudentRepository;
    this.#SalesItemsRepository = SalesItemsRepository;
    this.#EmailService = EmailService;
  }

  async execute({ email, ip = 'Não obtido', agent = 'Não obtido' }) {
    const student = await this.#StudentRepository.findByEmail(email);
    if (!student)
      throw ApiError.badRequest(
        'Nenhuma compra encontrada com o e-mail informado',
      );
    const salesItems = await this.#SalesItemsRepository.findStudentSales(
      student.id,
    );
    if (salesItems.length === 0)
      throw ApiError.badRequest(
        'Nenhuma compra encontrada com o e-mail informado',
      );
    const userHistory = await this.#UserHistoryRepository.find({
      id_student: student.id,
      params: {
        '"success"': false,
      },
    });
    if (userHistory) {
      await this.#UserHistoryRepository.delete({ id: userHistory.id });
    }
    const data = {
      id_student: student.id,
      id_type: findUserHistoryTypeByKey('refund').id,
      params: {
        ip,
        success: false,
        verification_code: randomFixedInteger(6),
        agent,
      },
    };
    await new RefundCode(this.#EmailService).send({
      student_name: student.full_name,
      email: student.email,
      verification_code: data.params.verification_code,
    });
    await this.#UserHistoryRepository.create(data);
  }
};
