const Balance_history = require('../models/Balance_history');

const createBalanceHistory = async (data, t = null) => {
  const balanceHistory = await Balance_history.create(
    data,
    t
      ? {
          transaction: t,
        }
      : null,
  );
  return balanceHistory;
};

const updateBalanceHistory = async (where, data) =>
  Balance_history.update(data, { where });

const findOneBalanceHistory = async (where) => Balance_history.findOne(where);

module.exports = {
  createBalanceHistory,
  updateBalanceHistory,
  findOneBalanceHistory,
};
