const { Op } = require('sequelize');
const sequelize = require('sequelize');
const Transactions = require('../../database/models/Transactions');
const { findTransactionTypeByKey } = require('../../types/transactionTypes');
const {
  findTransactionStatusByKey,
} = require('../../status/transactionStatus');
const date = require('../../utils/helpers/date');
const { DATABASE_DATE } = require('../../types/dateTypes');

/**
 * @typedef {Object} Commission
 * @property {number} user_net_amount
 */

/**
 * @typedef {Object} FutureRelease
 * @property {number} amount
 * @property {Date} release_date
 */
module.exports = class TransactionsRepository {
  /**
   *
   * @param {number} id_user
   * @returns {FutureRelease[]}
   */
  static async findFutureReleases(id_user) {
    const transactions = await Transactions.findAll({
      attributes: [
        'release_date',
        [sequelize.fn('sum', sequelize.col('user_net_amount')), 'amount'],
      ],
      group: 'release_date',
      raw: true,
      where: {
        id_user,
        released: false,
        id_type: findTransactionTypeByKey('commission').id,
        release_date: {
          [Op.not]: null,
        },
        id_status: findTransactionStatusByKey('pending').id,
      },
    });

    return transactions;
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

  static async findConfirmedWithdrawals(id_user) {
    const total = await Transactions.sum('withdrawal_total', {
      where: {
        id_user,
        id_type: findTransactionTypeByKey('withdrawal').id,
        id_status: findTransactionStatusByKey('paid').id,
        created_at: {
          [Op.gt]: date().utc().startOf('month').format('YYYY-MM-DD'),
        },
      },
    });
    return total;
  }

  static async findMetrics(id_user) {
    const paidPromise = Transactions.findAll({
      attributes: [
        [sequelize.fn('sum', sequelize.col('user_net_amount')), 'total'],
      ],
      raw: true,
      where: {
        id_user,
        id_type: findTransactionTypeByKey('commission').id,
        [Op.or]: {
          id_status: findTransactionStatusByKey('paid').id,
          [Op.and]: {
            id_status: findTransactionStatusByKey('pending').id,
            release_date: {
              [Op.ne]: null,
            },
          },
        },
      },
    });
    const refundedPromise = Transactions.findAll({
      attributes: [
        [sequelize.fn('sum', sequelize.col('user_net_amount')), 'total'],
      ],
      raw: true,
      where: {
        id_user,
        id_status: findTransactionStatusByKey('refunded').id,
        id_type: findTransactionTypeByKey('commission').id,
      },
    });
    const costRefundPromise = Transactions.findAll({
      attributes: [[sequelize.fn('sum', sequelize.col('fee_total')), 'total']],
      raw: true,
      where: {
        id_user,
        id_status: findTransactionStatusByKey('paid').id,
        id_type: findTransactionTypeByKey('cost_refund').id,
      },
    });
    const costAffiliatePromise = Transactions.findAll({
      attributes: [
        [sequelize.fn('sum', sequelize.col('user_net_amount')), 'total'],
      ],
      raw: true,
      where: {
        id_user,
        id_status: findTransactionStatusByKey('paid').id,
        id_type: findTransactionTypeByKey('cost_affiliate').id,
      },
    });
    const [paid, refunded, costRefund, costAffiliate] = await Promise.all([
      paidPromise,
      refundedPromise,
      costRefundPromise,
      costAffiliatePromise,
    ]);

    return {
      refunded:
        (refunded[0].total || 0) +
        (costRefund[0].total || 0) +
        (costAffiliate[0].total || 0),
      paid: paid[0].total || 0,
    };
  }

  static async findBlockedTransactions({ id_user }) {
    const total = await Transactions.findAll({
      attributes: [
        [sequelize.fn('sum', sequelize.col('user_net_amount')), 'blocked'],
      ],
      raw: true,
      where: {
        id_user,
        released: false,
        id_type: findTransactionTypeByKey('commission').id,
        id_status: findTransactionStatusByKey('pending').id,
        release_date: {
          [Op.ne]: null,
        },
      },
    });

    return total[0].blocked;
  }

  /**
   *
   * @param {number} id_user
   * @returns {Commission[]}
   */
  static async findForWithheldBalance(id_user) {
    const id_type = findTransactionTypeByKey('commission').id;
    const cardCommissionsPromise = Transactions.sum('user_net_amount', {
      where: {
        id_user,
        id_type,
        method: 'card',
        created_at: {
          [Op.gte]: date().utc().subtract(29, 'days').format(DATABASE_DATE),
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

    const billetCommissionsPromise = Transactions.sum('user_net_amount', {
      where: {
        id_user,
        id_type,
        method: 'billet',
        release_date: {
          [Op.gte]: date().utc().subtract(28, 'd').format(DATABASE_DATE),
        },
      },
    });

    const pixCommissionsPromise = Transactions.sum('user_net_amount', {
      where: {
        id_user,
        id_type,
        method: 'pix',
        release_date: {
          [Op.gte]: date().utc().subtract(29, 'days').format(DATABASE_DATE),
        },
      },
    });

    const [card, billet, pix] = await Promise.all([
      cardCommissionsPromise,
      billetCommissionsPromise,
      pixCommissionsPromise,
    ]);

    return card + billet + pix;
  }
};
