const ApiError = require('../../error/ApiError');

module.exports = class CreateCode {
  #UserHistoryRepository;

  #StudentRepository;

  #SalesItemsRepository;

  constructor({
    UserHistoryRepository,
    StudentRepository,
    SalesItemsRepository,
  }) {
    this.#UserHistoryRepository = UserHistoryRepository;
    this.#StudentRepository = StudentRepository;
    this.#SalesItemsRepository = SalesItemsRepository;
  }

  async execute(code) {
    const userHistory = await this.#UserHistoryRepository.find({
      params: {
        '"verification_code"': code,
      },
    });
    if (!userHistory) throw ApiError.badRequest('Código inválido');
    const student = await this.#StudentRepository.findById(
      userHistory.id_student,
    );
    if (!student) throw ApiError.badRequest('Estudante não encontrado');
    const salesItems = await this.#SalesItemsRepository.findStudentSales(
      userHistory.id_student,
    );
    await this.#UserHistoryRepository.update(
      { id: userHistory.id },
      {
        params: {
          ...userHistory.params,
          success: true,
        },
      },
    );
    return salesItems;
  }
};
