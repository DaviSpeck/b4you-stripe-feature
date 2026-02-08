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
};
