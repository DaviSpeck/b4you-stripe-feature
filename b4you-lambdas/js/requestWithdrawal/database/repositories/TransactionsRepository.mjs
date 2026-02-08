import { Op } from 'sequelize';
import { Transactions } from '../models/Transactions.mjs';
import { findTransactionTypeByKey } from '../../types/transactionTypes.mjs';
import { date } from '../../utils/date.mjs';
const DATABASE_DATE = 'YYYY-MM-DD HH:mm:ss';
import { findTransactionStatusByKey } from '../../status/transactionStatus.mjs';

/**
 * @typedef {Object} Commission
 * @property {number} user_net_amount
 */
export class TransactionsRepository {
  static async findHighestSale(id_user) {
    const highestSale = await Transactions.findOne({
      raw: true,
      attributes: ['user_net_amount'],
      where: {
        id_user,
        id_type: findTransactionTypeByKey('commission').id,
        created_at: {
          [Op.gte]: date().subtract(29, 'd').format(DATABASE_DATE),
        },
        [Op.or]: {
          id_status: findTransactionStatusByKey('paid').id,
          [Op.and]: {
            id_status: findTransactionStatusByKey('pending').id,
            release_date: {
              [Op.not]: null,
            },
          },
        },
      },
    });
    if (!highestSale) return 0;
    return highestSale.user_net_amount;
  }

  static async sum30DaysTotal(id_user) {
    const highestSale = await Transactions.sum('user_net_amount', {
      where: {
        id_user,
        id_type: findTransactionTypeByKey('commission').id,
        created_at: {
          [Op.gte]: date().subtract(29, 'd').format(DATABASE_DATE),
        },
        [Op.or]: {
          id_status: findTransactionStatusByKey('paid').id,
          [Op.and]: {
            id_status: findTransactionStatusByKey('pending').id,
            release_date: {
              [Op.not]: null,
            },
          },
        },
      },
    });
    return highestSale ?? 0;
  }

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

  /**
   *
   * @param {number} id_user
   * @returns {Commission[]}
   */
  static async findForWithheldBalance(id_user) {
    const cardCommissionsPromise = Transactions.findAll({
      attributes: ['user_net_amount'],
      where: {
        id_user,
        id_type: findTransactionTypeByKey('commission').id,
        id_status: findTransactionStatusByKey('paid').id,
        released: true,
        method: 'card',
        created_at: {
          [Op.gte]: date().utc().subtract(30, 'days').format(DATABASE_DATE),
        },
      },
    });

    const billetCommissionsPromise = Transactions.findAll({
      attributes: ['user_net_amount'],
      where: {
        id_user,
        id_type: findTransactionTypeByKey('commission').id,
        id_status: findTransactionStatusByKey('paid').id,
        released: true,
        method: 'billet',
        release_date: {
          [Op.gte]: date().utc().subtract(29, 'd').format(DATABASE_DATE),
        },
      },
    });

    const pixCommissionsPromise = Transactions.findAll({
      attributes: ['user_net_amount'],
      where: {
        id_user,
        id_type: findTransactionTypeByKey('commission').id,
        id_status: findTransactionStatusByKey('paid').id,
        released: true,
        method: 'pix',
        release_date: {
          [Op.gte]: date().utc().subtract(30, 'days').format(DATABASE_DATE),
        },
      },
    });

    const [card, billet, pix] = await Promise.all([
      cardCommissionsPromise,
      billetCommissionsPromise,
      pixCommissionsPromise,
    ]);

    return [...card, ...billet, ...pix].map((t) => t.toJSON());
  }

  /**
   *
   * @param {number} id_user
   * @returns {Commission[]}
   */
  static async findPendingCommissions(id_user) {
    const transactions = await Transactions.findAll({
      nest: true,
      attributes: ['user_net_amount'],
      include: [
        {
          association: 'sales_items',
          attributes: [],
        },
      ],
      where: {
        id_user,
        'id_status': findTransactionStatusByKey('pending').id,
        'release_date': {
          [Op.ne]: null,
        },
        'id_type': findTransactionTypeByKey('commission').id,
        '$sales_items.paid_at$': {
          [Op.gte]: date().utc().subtract(30, 'days').format(DATABASE_DATE),
        },
      },
    });

    return transactions.map((t) => t.toJSON());
  }
}
