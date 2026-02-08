const Withdrawals = require('../models/Withdrawals');
const Transactions = require('../models/Transactions');
const Users = require('../models/Users');

const createWithdrawal = async (payoutObj, t = null) => {
  const withdrawal = await Withdrawals.create(
    payoutObj,
    t
      ? {
          transaction: t,
        }
      : null,
  );
  return withdrawal;
};

const findAllUserWithdrawals = async (id_user) => {
  const withdrawals = await Withdrawals.findAll({
    where: {
      id_user,
    },
    include: [
      {
        model: Transactions,
        as: 'transaction',
      },
      {
        model: Users,
        as: 'user',
      },
    ],
  });
  return withdrawals;
};

module.exports = {
  createWithdrawal,
  findAllUserWithdrawals,
};
