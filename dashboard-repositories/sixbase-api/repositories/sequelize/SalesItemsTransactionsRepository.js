const SalesItemsTransactions = require('../../database/models/Sales_items_transactions');

module.exports = class SalesItemsTransactionsRepository {
  static async create(data, t = null) {
    const saleItemTransaction = await SalesItemsTransactions.create(
      data,
      t ? { transaction: t } : null,
    );
    return saleItemTransaction;
  }
};
