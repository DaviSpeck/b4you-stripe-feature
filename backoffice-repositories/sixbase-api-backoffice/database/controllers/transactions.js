const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const Transactions = require('../models/Transactions');
const {
  findTransactionStatusByKey,
} = require('../../status/transactionStatus');
const { findTransactionTypeByKey } = require('../../types/transactionTypes');
const dateHelper = require('../../utils/helpers/date');

const findTransactionsCommission = async ({ start_date, end_date }) => {
  const where = {
    id_status: {
      [Op.or]: [
        findTransactionStatusByKey('pending').id,
        findTransactionStatusByKey('paid').id,
      ],
    },
    id_type: findTransactionTypeByKey('commission').id,
  };
  if (start_date && end_date)
    where.created_at = {
      [Op.between]: [
        dateHelper(start_date).startOf('day'),
        dateHelper(end_date).endOf('day'),
      ],
    };
  const transactions = await Transactions.findAll({
    where,
    raw: true,
    attributes: [
      'id_status',
      [Sequelize.fn('sum', Sequelize.col('user_net_amount')), 'total_amount'],
    ],
    group: ['id_status'],
  });
  return transactions;
};

const updateTransaction = async (where, transactionObj, t = null) => {
  const transaction = await Transactions.update(
    transactionObj,
    {
      where,
    },
    t
      ? {
        transaction: t,
      }
      : null,
  );
  return transaction;
};

const createTransaction = async (transactionObject, t = null) => {
  const transaction = await Transactions.create(
    transactionObject,
    t
      ? {
        transaction: t,
      }
      : null,
  );
  return transaction;
};

module.exports = {
  findTransactionsCommission,
  updateTransaction,
  createTransaction,
};
