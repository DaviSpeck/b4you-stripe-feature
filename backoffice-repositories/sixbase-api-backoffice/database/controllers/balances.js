const Balances = require('../models/Balances');

module.exports.findUserBalance = async (id_user) => {
  const balance = await Balances.findOne({
    raw: true,
    where: {
      id_user,
    },
  });
  return balance;
};

module.exports.updateBalance = async (id_user, amount, operation, t = null) => {
  const balance = await Balances[operation]('amount', {
    by: amount,
    where: { id_user },
    transaction: t,
    lock: true,
  });
  return balance;
};
