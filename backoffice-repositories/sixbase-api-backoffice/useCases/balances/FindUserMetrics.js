const ApiError = require('../../error/ApiError');

module.exports = class FindUserMetrics {
  constructor({ UsersRepository, CommissionsRepository }) {
    this.UsersRepository = UsersRepository;
    this.CommissionsRepository = CommissionsRepository;
  }

  async execute(user_uuid) {
    const user = await this.UsersRepository.findByUUID(user_uuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');
    const transactions = await this.CommissionsRepository.findMetrics(user.id);
    return transactions;
  }
};