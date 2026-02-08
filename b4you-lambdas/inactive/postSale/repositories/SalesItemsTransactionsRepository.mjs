import { Sales_items_transactions } from '../database/models/Sales_items_transactions.mjs';

export class SalesItemsTransactionsRepository {
  static async create(data, t = null) {
    const sit = await Sales_items_transactions.create(data, {
      transaction: t,
    });

    return sit.toJSON();
  }
}
