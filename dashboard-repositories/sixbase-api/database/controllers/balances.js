const Balances = require('../models/Balances');

const createBalance = async (id_user, t = null) => {
  const balance = await Balances.create(
    { id_user },
    t ? { transaction: t } : null,
  );
  return balance;
};

const findUserBalance = async (id_user) => {
  const userBalance = await Balances.sequelize.query(
    'select userBalance(:id_user) as amount',
    {
      plain: true,
      replacements: {
        id_user,
      },
    },
  );
  return userBalance;
};

const updateBalance = async (id_user, amount, operation, t = null) => {
  const balance = await Balances[operation]('amount', {
    by: amount,
    where: { id_user },
    transaction: t,
    lock: true,
  });
  return balance;
};

module.exports = { createBalance, updateBalance, findUserBalance };
