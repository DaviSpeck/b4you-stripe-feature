import { Balances } from '../models/Balances.mjs';
export class BalancesRepository {
  static async update(id_user, amount, operation, t = null) {
    const balance = await Balances.findOne({
      where: { id_user },
      lock: t ? t.LOCK.UPDATE : false,
      transaction: t,
    });
    await balance[operation]('amount', {
      by: amount,
      transaction: t,
    });
    return balance;
  }
  static async find(id_user) {
    const balance = await Balances.findOne({
      where: {
        id_user,
      },
    });
    return balance;
  }
}
