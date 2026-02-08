import { Balances } from '../models/Balances.mjs';
export class BalancesRepository {
  static async update(id_user, amount, operation, t = null) {
    const balance = await Balances[operation]('amount', {
      by: amount,
      where: { id_user },
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
