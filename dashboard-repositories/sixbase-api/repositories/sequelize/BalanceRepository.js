const Balances = require('../../database/models/Balances');

module.exports = class BalanceRepository {
  static async find(id_user) {
    const balance = await Balances.findOne({
      where: {
        id_user,
      },
    });
    return balance;
  }

  static async update(id_user, amount, operation, t = null) {
    const balance = await Balances[operation]('amount', {
      by: amount,
      where: { id_user },
      transaction: t,
      lock: true,
    });
    return balance;
  }
};
