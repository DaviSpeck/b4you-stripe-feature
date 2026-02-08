import { Balance_history } from '../database/models/BalanceHistory.mjs';

export class BalanceHistoryRepository {
  static async create(data, t = null) {
    const balanceHistory = await Balance_history.create(data, {
      transaction: t,
    });
    return balanceHistory.toJSON();
  }
}
