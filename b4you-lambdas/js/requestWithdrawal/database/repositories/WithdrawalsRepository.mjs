import { Withdrawals } from '../models/Withdrawals.mjs';

export class WithdrawalRepository {
  static async create(data, t = null) {
    const withdrawal = await Withdrawals.create(data, {
      transaction: t,
    });

    return withdrawal.toJSON();
  }
}
