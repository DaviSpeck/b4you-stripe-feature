const ApiError = require('../../error/ApiError');

module.exports = class FindUserInfo {
  constructor({ StudentRepository, SalesItemsRepository }) {
    this.StudentRepository = StudentRepository;
    this.SalesItemsRepository = SalesItemsRepository;
  }

  async execute(userUuid) {
    const student = await this.StudentRepository.findByUUID(userUuid);
    if (!student) throw ApiError.badRequest('Usuário não encontrado');
    const sales = await this.SalesItemsRepository.findStudentSales(student.id);
    return { sales, student };
  }
};