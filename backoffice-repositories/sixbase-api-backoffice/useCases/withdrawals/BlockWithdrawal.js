const ApiError = require('../../error/ApiError');
const {
  createLogBackoffice,
} = require('../../database/controllers/logs_backoffice');
const { findRoleTypeByKey } = require('../../types/userEvents');
const Withdrawal_notes = require('../../database/models/Withdrawal_notes');

module.exports = class BlockUserWithdrawal {
  constructor(WithdrawalSettingsRepository, UsersRepository) {
    this.UsersRepository = UsersRepository;
    this.WithdrawalSettingsRepository = WithdrawalSettingsRepository;
  }

  async execute(user_uuid, blocked, id_user, ip_address = '', user_agent = '', reason = '') {
    const user = await this.UsersRepository.findByUUID(user_uuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');

    await this.WithdrawalSettingsRepository.update(
      { id_user: user.id },
      { blocked },
    );

    if (blocked) {
      await Withdrawal_notes.create({
        id_user: user.id,
        id_type: 0,
        id_user_backoffice: id_user,
        text: reason || 'Saque bloqueado pelo backoffice',

      });
    } else if (!blocked) {
      await Withdrawal_notes.create({
        id_user: user.id,
        id_type: 1,
        id_user_backoffice: id_user,
        text: reason || 'Saque desbloqueado pelo backoffice',
      });
    }

    await createLogBackoffice({
      id_user_backoffice: id_user,
      id_event: blocked
        ? findRoleTypeByKey('block-withdrawal').id
        : findRoleTypeByKey('unblock-withdrawal').id,
      ip_address,
      params: { user_agent, reason: reason || '' },
      id_user: user.id,
    });
    return true;
  }
};
