import { Transactions } from '../database/models/Transactions.mjs';

export class TransactionsRepository {
  static async create(data, t = null) {
    const transaction = await Transactions.create(data, {
      transaction: t,
    });
    return transaction.toJSON();
  }

  static async find(where, t = null) {
    const transaction = await Transactions.findOne({
      where,
      transaction: t,
    });

    return transaction;
  }

  static async update(where, data, t = null) {
    await Transactions.update(data, {
      where,
      transaction: t,
    });
  }
}
