const { Op } = require('sequelize');
const Products = require('../models/Products');
const Sales = require('../models/Sales');
const Sales_items = require('../models/Sales_items');
const Transactions = require('../models/Transactions');
const {
  findTransactionType,
  findTransactionTypeByKey,
} = require('../../types/transactionTypes');

const DateHelper = require('../../utils/helpers/date');
const { DATABASE_DATE } = require('../../types/dateTypes');
const {
  findTransactionStatusByKey,
} = require('../../status/transactionStatus');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const { findRoleType, findRoleTypeByKey } = require('../../types/roles');
const { findRefundStatusByKey } = require('../../status/refundStatus');

const createTransaction = async (transactionObject, t = null) => {
  try {
    const transaction = await Transactions.create(
      transactionObject,
      t
        ? {
            transaction: t,
          }
        : null,
    );
    return transaction;
  } catch (error) {
    throw error;
  }
};

const findTransactionById = async (id) => {
  try {
    const transaction = await Transactions.findByPk(id, {
      raw: true,
      nest: true,
      include: [
        {
          model: Sales,
          as: 'sale',
          include: [
            {
              model: Products,
              as: 'product',
            },
          ],
        },
      ],
    });
    return transaction;
  } catch (error) {
    throw error;
  }
};

const findTransactionByIdSale = async (id_sale) => {
  try {
    const transaction = await Transactions.findOne({
      raw: true,
      nest: true,
      where: {
        id_sale,
      },
      include: [
        {
          model: Sales,
          as: 'sale',
          include: [
            {
              model: Products,
              as: 'product',
            },
          ],
        },
      ],
    });
    return transaction;
  } catch (error) {
    throw error;
  }
};

const findTransactionByIdSaleItem = async (id_sale_item) => {
  try {
    const transaction = await Transactions.findOne({
      raw: true,
      where: {
        id_sale_item,
      },
    });

    return transaction;
  } catch (error) {
    throw error;
  }
};

const updateTransaction = async (where, transactionObj, t = null) => {
  try {
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
  } catch (error) {
    throw error;
  }
};

const findTransaction = async (where) => {
  try {
    const transaction = await Transactions.findOne({
      where,
      include: [
        {
          association: 'user',
        },
      ],
    });

    return transaction;
  } catch (error) {
    throw error;
  }
};

const findAllTransactions = async (where) => {
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

  if (transactions.length > 0) return transactions.map((t) => t.toJSON());
  return transactions;
};

const findMetrics = async (where) => {
  const transactions = await Transactions.findAll({
    where,
    nest: true,
    include: [
      {
        model: Sales_items,
        as: 'sales_items',
        include: [
          {
            model: Products,
            as: 'product',
            paranoid: false,
          },
        ],
      },
    ],
  });
  return transactions;
};

const findTransactionsPaginated = async ({ id_user }, page, size) => {
  const limit = parseInt(size, 10);
  const offset = page * limit;
  const transactions = await Transactions.findAndCountAll({
    nest: true,
    where: {
      id_user,
      id_type: {
        [Op.ne]: findTransactionType('Pagamento').id,
      },
    },
    limit,
    offset,
    order: [['id', 'desc']],
    include: [
      {
        model: Sales_items,
        as: 'sales_items',
        include: [
          {
            model: Products,
            as: 'product',
            paranoid: false,
          },
        ],
      },
    ],
  });
  return transactions;
};

const findTransactionsToConfirmCommission = async (where) =>
  Transactions.findAll({
    nest: true,
    where,
    include: [
      {
        association: 'user',
        include: [
          {
            association: 'user_sale_settings',
          },
        ],
      },
    ],
  });

const findBalanceTransactions = async ({
  endDate,
  id_status,
  id_type,
  id_user,
  page,
  product_uuid,
  size,
  startDate,
}) => {
  const offset = Number(page) * Number(size);
  const limit = Number(size);
  let where = {
    id_user,
    id_type: {
      [Op.notIn]: [
        findTransactionTypeByKey('cost').id,
        findTransactionTypeByKey('payment').id,
        findTransactionTypeByKey('cost_refund').id,
        findTransactionTypeByKey('cost_affiliate').id,
      ],
    },
    id_status: {
      [Op.ne]: findTransactionStatusByKey('expired').id,
    },
  };
  if (id_type) {
    where.id_type = {
      [Op.and]: {
        [Op.notIn]: [
          findTransactionTypeByKey('cost').id,
          findTransactionTypeByKey('payment').id,
          findTransactionTypeByKey('cost_refund').id,
          findTransactionTypeByKey('cost_affiliate').id,
        ],
        [Op.in]: id_type,
      },
    };
  }
  if (id_status)
    where.id_status = {
      [Op.ne]: [findTransactionStatusByKey('expired').id],
      [Op.in]: id_status,
    };
  if (startDate && endDate) {
    where.created_at = {
      [Op.between]: [
        DateHelper(startDate).startOf('day').format(DATABASE_DATE),
        DateHelper(endDate).endOf('day').format(DATABASE_DATE),
      ],
    };
  }
  if (product_uuid)
    where = { ...where, '$sales_items.product.uuid$': product_uuid };

  const transactions = await Transactions.findAndCountAll({
    nest: true,
    distinct: true,
    subQuery: false,
    where,
    order: [['created_at', 'DESC']],
    group: ['id'],
    offset,
    limit,
    attributes: [
      'id',
      'uuid',
      'user_net_amount',
      'withdrawal_total',
      'created_at',
      'id_type',
      'id_status',
      'fee_total',
      'released',
      'release_date',
    ],
    include: [
      {
        association: 'sales_items',
        attributes: ['id_status', 'id_affiliate', 'valid_refund_until'],
        required: false,
        include: [
          {
            association: 'product',
            attributes: ['uuid', 'name'],
            paranoid: false,
          },
        ],
      },
    ],
  });

  const withoutDeniedCommissions = transactions.rows.filter((r) => {
    if (r.id_type === 3 && r.id_status === 4) return false;
    return true;
  });

  return {
    rows: withoutDeniedCommissions.map((r) => r.toJSON()),
    count: transactions.count.length,
  };
};

const findBalanceRefundTransactions = async (where) => {
  const saleItem = await Sales_items.findOne({
    include: [
      {
        association: 'affiliate',
        attributes: ['id', 'id_user'],
      },
      {
        model: Transactions,
        as: 'transactions',
        where,
      },
    ],
  });

  const refundTransactions = await Transactions.findAll({
    where: {
      id_type: {
        [Op.in]: [
          findTransactionTypeByKey('cost_refund').id,
          findTransactionTypeByKey('commission').id,
          findTransactionTypeByKey('cost_affiliate').id,
        ],
      },
    },
    attributes: [
      'id',
      'uuid',
      'user_net_amount',
      'withdrawal_total',
      'fee_total',
      'created_at',
      'id_type',
      'id_status',
      'fee_total',
      'released',
      'id_role',
    ],
    include: [
      {
        association: 'user',
        attributes: ['id', 'full_name', 'email', 'document_number'],
      },
      {
        association: 'sales_items',
        attributes: [],
        required: true,
        where: {
          id: saleItem.id,
        },
      },
    ],
  });

  return refundTransactions
    .filter(
      (t) =>
        (!t.id_role || t.id_role !== findRoleTypeByKey('coproducer').id) &&
        (t.id_type === findTransactionTypeByKey('commission').id ||
          t.id_type === findTransactionTypeByKey('cost_refund').id ||
          (t.id_type === findTransactionTypeByKey('cost_affiliate').id &&
            t.user.id === where.id_user)),
    )
    .map((rt) => ({
      ...rt.toJSON(),
      role: rt.id_role ? findRoleType(rt.id_role).label : null,
    }));
};

const findOneTransactionWithSaleItemsAndCommissions = async (where) =>
  Transactions.findOne({
    where,
    include: [
      {
        association: 'sales_items',
        include: [
          {
            association: 'transactions',
          },
          {
            association: 'product',
            paranoid: false,
            include: [
              {
                association: 'producer',
              },
            ],
          },
          {
            association: 'student',
          },
          {
            association: 'subscription',
            required: false,
            include: [
              {
                association: 'plan',
                paranoid: false,
              },
            ],
          },
        ],
      },
    ],
  });

const findStudentTransactionsPaginated = async (where, page, size) => {
  const limit = parseInt(size, 10);
  const offset = limit * parseInt(page, 10);
  const transactions = await Transactions.findAndCountAll({
    subQuery: false,
    where: {
      id_type: findTransactionTypeByKey('payment').id,
    },
    limit,
    offset,
    include: [
      {
        association: 'sales_items',
        where: {
          id_student: where.id_student,
          id_status: {
            [Op.or]: [
              findSalesStatusByKey('paid').id,
              findSalesStatusByKey('request-refund').id,
            ],
          },
        },
        include: [
          {
            association: 'product',
            paranoid: false,
          },
          {
            association: 'refund',
            required: false,
            where: {
              id_status: findRefundStatusByKey('requested-by-student').id,
            },
          },
        ],
      },
      {
        association: 'charge',
      },
      {
        association: 'user',
      },
    ],
  });

  return transactions;
};

const findTransactionDetails = async ({ uuid, id_user }) =>
  Transactions.findOne({
    where: {
      uuid,
      id_user,
    },
    include: [
      {
        association: 'sales_items',
        include: [
          {
            association: 'transactions',
            where: {
              id_user,
            },
          },
        ],
      },
    ],
  });

module.exports = {
  createTransaction,
  findAllTransactions,
  findBalanceTransactions,
  findMetrics,
  findTransaction,
  findTransactionById,
  findTransactionByIdSale,
  findTransactionByIdSaleItem,
  findTransactionsPaginated,
  findBalanceRefundTransactions,
  findTransactionsToConfirmCommission,
  updateTransaction,
  findOneTransactionWithSaleItemsAndCommissions,
  findStudentTransactionsPaginated,
  findTransactionDetails,
};
