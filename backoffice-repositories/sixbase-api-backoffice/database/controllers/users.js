const { Op } = require('sequelize');
const Users = require('../models/Users');
const Verify_identity = require('../models/Verify_identity');
const {
  findTransactionStatusByKey,
} = require('../../status/transactionStatus');
const dateHelper = require('../../utils/helpers/date');

const createUser = async (userObject, t = null) => {
  try {
    const user = await Users.create(userObject, t ? { transaction: t } : null);
    return user.toJSON();
  } catch (error) {
    throw error;
  }
};

const updateAddress = async (id, addressObject) => {
  try {
    const address = await Users.update(addressObject, {
      where: {
        id,
      },
    });
    return address;
  } catch (error) {
    throw error;
  }
};

const updateBankAccount = async (id, bankObject) => {
  try {
    const bank = await Users.update(bankObject, {
      where: {
        id,
      },
    });
    return bank;
  } catch (error) {
    throw error;
  }
};

const updateUser = async (id, userObject) => {
  try {
    const user = await Users.update(userObject, {
      where: {
        id,
      },
    });
    return user;
  } catch (error) {
    throw error;
  }
};

const findUserByEmail = async (email) => {
  const user = await Users.findOne({
    where: { email },
  });
  if (user) return user.toJSON();
  return user;
};

const findUserByUUID = async (uuid) => {
  try {
    const user = await Users.findOne({
      where: { uuid },
    });
    return user;
  } catch (error) {
    throw error;
  }
};

const findUserByID = async (id) =>
  Users.findByPk(id, {
    include: [
      {
        model: Verify_identity,
        as: 'verify_identity',
      },
    ],
  });

const findRawUserByID = async (id) =>
  Users.findByPk(id, {
    attributes: [
      'street',
      'city',
      'number',
      'neighborhood',
      'zipcode',
      'complement',
      'state',
      'country',
    ],
  });

const findUserByEmailOrDocument = async ({ email, document_number }) =>
  Users.findOne({
    where: {
      [Op.or]: {
        email,
        document_number,
      },
    },
  });

const findUserFiltered = async (where, page, size) => {
  const offset = Number(page) * Number(size);
  const limit = Number(size);
  const users = await Users.findAndCountAll({
    where,
    nest: true,
    distinct: true,
    offset,
    limit,
    order: [['id', 'DESC']],
    attributes: [
      'id',
      'uuid',
      'email',
      'first_name',
      'last_name',
      'document_number',
      'zipcode',
      'street',
      'number',
      'neighborhood',
      'city',
      'state',
      'whatsapp',
      'bank_code',
      'agency',
      'account_number',
      'account_type',
      'operation',
      'status_cnpj',
      'created_at',
      'follow_up',
    ],
    include: [
      {
        association: 'withdrawal_settings',
        attributes: ['blocked'],
      },
      {
        association: 'balance',
        attributes: ['amount'],
      },
    ],
  });
  return users;
};

const findUserMetrics = async ({ start_date, end_date, page, size }) => {
  const limit = parseInt(size, 10);
  const offset = page * limit;
  const where = {
    id_status: {
      [Op.or]: [
        findTransactionStatusByKey('pending').id,
        findTransactionStatusByKey('paid').id,
      ],
    },
  };
  if (start_date && end_date)
    where.created_at = {
      [Op.between]: [
        dateHelper(start_date).startOf('day').utc(),
        dateHelper(end_date).endOf('day').utc(),
      ],
    };

  const users = await Users.findAndCountAll({
    attributes: ['uuid', 'full_name', 'email'],
    include: [
      {
        association: 'commissions',
        required: false,
        where,
        attributes: ['amount', 'id_status'],
      },
    ],
    offset,
    limit,
    distinct: true,
  });
  return users;
};

module.exports = {
  findUserMetrics,
  createUser,
  findUserByEmail,
  findUserByEmailOrDocument,
  findUserByID,
  findUserByUUID,
  findUserFiltered,
  updateAddress,
  updateBankAccount,
  updateUser,
  findRawUserByID,
};
