const { Op } = require('sequelize');
const UserBankAccounts = require('../models/Users_bank_accounts');

const createUserBankAccounts = async (userObject) => {
  try {
    const row = await UserBankAccounts.create(userObject); 
    return row.toJSON();
  } catch (error) {
    throw error;
  }
};

const findUserBankAccounts = (where) => UserBankAccounts.findOne({ where });

  const findLastPendingByUser = (id_user) =>
  UserBankAccounts.findOne({
    where: { id_user, pending_approval: true },
    order: [['created_at', 'DESC']],
    attributes: ['id', 'is_company', 'pending_approval', 'created_at'],
  });

module.exports = {
  createUserBankAccounts,
  findUserBankAccounts,
  findLastPendingByUser,
};
