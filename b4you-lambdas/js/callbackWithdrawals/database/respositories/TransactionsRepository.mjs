import { Op } from 'sequelize';
import { Transactions } from '../models/Transactions.mjs';
import { findTransactionTypeByKey } from '../../types/transactionTypes.mjs';
import { date } from '../../utils/date.mjs';
const DATABASE_DATE = 'YYYY-MM-DD HH:mm:ss';

export class TransactionsRepository {
  static async create(data, t = null) {
    const transaction = await Transactions.create(data, {
      transaction: t,
    });
    return transaction.toJSON();
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

    return transactions.map((t) => t.toJSON());
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
        : null
    );
  }

  static async findForWithheldBalance(id_user) {
    const transactions = await Transactions.findAll({
      attributes: ['user_net_amount'],
      where: {
        id_user,
        id_type: findTransactionTypeByKey('commission').id,
        '$sales_items.paid_at$': {
          [Op.gte]: date().subtract(30, 'd').format(DATABASE_DATE),
        },
        '$sales_items.id_status$': 2,
      },
      include: [
        {
          association: 'sales_items',
          attributes: ['paid_at'],
        },
      ],
    });

    return transactions.map((t) => t.toJSON());
  }
}
