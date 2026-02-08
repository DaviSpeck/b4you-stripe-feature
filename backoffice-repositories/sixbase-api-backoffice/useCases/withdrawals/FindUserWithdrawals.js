const ApiError = require('../../error/ApiError');

module.exports = class FindUserWithdrawals {
  constructor(WithdrawalRepository, UsersRepository) {
    this.UsersRepository = UsersRepository;
    this.WithdrawalRepository = WithdrawalRepository;
  }

  async execute({ user_uuid, page, size }) {
    const user = await this.UsersRepository.findByUUID(user_uuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');
    const withdrawals =
      await this.WithdrawalRepository.findPaginatedWithdrawals({
        page,
        size,
        where: { id_user: user.id },
      });
    return withdrawals;
  }
};