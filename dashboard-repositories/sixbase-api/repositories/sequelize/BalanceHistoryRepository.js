const Balance_history = require('../../database/models/Balance_history');

module.exports = class BalanceHistoryRepository {
  static async create(data, t = null) {
    const balanceHistory = await Balance_history.create(
      data,
      t
        ? {
            transaction: t,
          }
        : null,
    );
    return balanceHistory;
  }
};
