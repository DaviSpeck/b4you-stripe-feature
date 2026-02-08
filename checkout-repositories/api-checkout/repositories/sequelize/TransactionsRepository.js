const Transactions = require('../../database/models/Transactions');

module.exports = class TransactionsRepository {
  static async create(data, t = null) {
    const transactions = await Transactions.create(
      data,
      t ? { transaction: t } : null,
    );
    return transactions.toJSON();
  }

  static async update(where, data, t = null) {
    await Transactions.update(
      data,
      {
        where,
      },
      t
        ? {
            transaction: t,
          }
        : null,
    );
  }

  static async find(where, t = null) {
    const transaction = await Transactions.findOne({
      where,
      transaction: t,
      include: [
        {
          association: 'user',
        },
      ],
    });

    return transaction;
  }

  static async findAll(where) {
    const transactions = await Transactions.findAll({
      nest: true,
      where,
      include: [
        {
          association: 'sales_items',
          attributes: [],
        },
      ],
    });

    return transactions;
  }
};
