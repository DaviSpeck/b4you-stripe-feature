const { Op } = require('sequelize');
const Products = require('../models/Products');
const Sales = require('../models/Sales');
const Sales_items = require('../models/Sales_items');
const Transactions = require('../models/Transactions');
const Commissions = require('../models/Commissions');
const User_activity = require('../models/User_activity');
const {
  findTransactionType,
  findTransactionTypeByKey,
} = require('../../types/transactionTypes');

const DateHelper = require('../../utils/helpers/date');
const { DATABASE_DATE } = require('../../types/dateTypes');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const { findRoleType, findRoleTypeByKey } = require('../../types/roles');
const { findRefundStatusByKey } = require('../../status/refundStatus');
const {
  findTransactionStatusByKey,
} = require('../../status/transactionStatus');
const { findCommissionsStatus } = require('../../status/commissionsStatus');

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
    attributes: [
      'method',
      'released',
      'user_net_amount',
      'created_at',
      'release_date',
      'id_status',
      'id_user',
    ],
    include: [
      {
        association: 'sales_items',
        attributes: ['id_status', 'price', 'id_product'],
        include: [
          {
            association: 'product',
            attributes: ['name', 'uuid', 'hex_color'],
            paranoid: false,
          },
        ],
      },
    ],
  });
  return transactions.map((t) => t.toJSON());
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
  id_user,
  page,
  size,
  startDate,
}) => {
  const offset = Number(page) * Number(size);
  const limit = Number(size);
  const where = {
    id_user,
    id_type: findTransactionTypeByKey('withdrawal').id,
    method: ['pix', 'manual'],
    [Op.not]: {
      [Op.and]: [
        { method: 'manual' },
        { id_status: 4 },
      ],
    },
  };
  if (startDate && endDate) {
    where.created_at = {
      [Op.between]: [
        DateHelper(startDate).startOf('day').format(DATABASE_DATE),
        DateHelper(endDate).endOf('day').format(DATABASE_DATE),
      ],
    };
  }

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
  });

  return {
    rows: transactions.rows.map((r) => r.toJSON()),
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

const findTransactionChargeback = async (where) => {
  const transaction = await Transactions.findOne({
    where,
    include: [
      {
        association: 'sales_items',
        include: [
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
            association: 'transactions',
          },
        ],
      },
    ],
  });
  return transaction;
};

const findStatementTransactions = async ({
  id_user,
  startDate,
  endDate,
  types,
}) => {
  const hasTypes = types && Array.isArray(types) && types.length > 0;
  const includeRefunds = !hasTypes || types.includes('refund');
  const includeChargebacks = !hasTypes || types.includes('chargeback');
  const includeWithdrawals = !hasTypes || types.includes('withdrawal');
  const includeCommissions = !hasTypes || types.includes('commission');
  const includeActivity = !hasTypes || types.includes('activity');

  const createDateFilter = (dateField) => {
    if (startDate && endDate) {
      return {
        [dateField]: {
          [Op.between]: [
            DateHelper(startDate)
              .startOf('day')
              .add(3, 'hour')
              .format(DATABASE_DATE),
            DateHelper(endDate)
              .endOf('day')
              .add(3, 'hour')
              .format(DATABASE_DATE),
          ],
        },
      };
    }
    return {};
  };

  const createBeforeDateFilter = (dateField) => {
    if (startDate) {
      return {
        [dateField]: {
          [Op.lt]: DateHelper(startDate)
            .startOf('day')
            .add(3, 'hour')
            .format(DATABASE_DATE),
        },
      };
    }
    return {};
  };

  const queries = [];

  // Buscar TODAS as transações do período para cálculo do saldo
  // 1. REEMBOLSOS (commissions com id_status = 4)
  const refundsWhere = {
    id_user,
    id_status: findCommissionsStatus('refunded').id,
    ...createDateFilter('updated_at'),
  };

  queries.push(
    Commissions.findAll({
      where: refundsWhere,
      nest: true,
      order: [['updated_at', 'ASC']],
      attributes: ['id', 'amount', 'updated_at', 'id_status'],
    }),
  );

  // 2. CHARGEBACKS (commissions com id_status in (5, 6))
  const chargebacksWhere = {
    id_user,
    id_status: {
      [Op.in]: [
        findCommissionsStatus('chargeback').id,
        findCommissionsStatus('chargeback_dispute').id,
      ],
    },
    ...createDateFilter('updated_at'),
  };

  queries.push(
    Commissions.findAll({
      where: chargebacksWhere,
      nest: true,
      order: [['updated_at', 'ASC']],
      attributes: ['id', 'amount', 'updated_at', 'id_status'],
    }),
  );

  // 3. SAQUES (transactions com id_type = 1 e id_status in (1, 2))
  const withdrawalsWhere = {
    id_user,
    id_type: findTransactionTypeByKey('withdrawal').id,
    id_status: {
      [Op.in]: [
        findTransactionStatusByKey('pending').id,
        findTransactionStatusByKey('paid').id,
      ],
    },
    ...createDateFilter('created_at'),
  };

  queries.push(
    Transactions.findAll({
      where: withdrawalsWhere,
      nest: true,
      order: [['created_at', 'ASC']],
      attributes: [
        'id',
        'uuid',
        'withdrawal_total',
        'created_at',
        'updated_at',
        'id_type',
        'id_status',
      ],
    }),
  );

  // 4. COMISSÕES PAGAS (commissions com id_status = 3)
  const paidCommissionsWhere = {
    id_user,
    id_status: findCommissionsStatus('released').id,
    ...createDateFilter('created_at'),
  };

  queries.push(
    Commissions.findAll({
      where: paidCommissionsWhere,
      nest: true,
      order: [['created_at', 'ASC']],
      attributes: ['id', 'amount', 'created_at', 'id_status'],
    }),
  );

  // 5. COMISSÕES PENDENTES (commissions com id_status = 2)
  const pendingCommissionsWhere = {
    id_user,
    id_status: findCommissionsStatus('waiting').id,
    ...createDateFilter('created_at'),
  };

  queries.push(
    Commissions.findAll({
      where: pendingCommissionsWhere,
      nest: true,
      order: [['created_at', 'ASC']],
      attributes: ['id', 'amount', 'created_at', 'id_status'],
    }),
  );

  // 6. ATIVIDADE DO USUÁRIO (user_activity)
  const activityWhere = {
    id_user,
    ...createDateFilter('created_at'),
  };

  queries.push(
    User_activity.findAll({
      where: activityWhere,
      nest: true,
      order: [['created_at', 'ASC']],
      attributes: ['id', 'amount', 'reason', 'created_at'],
    }),
  );

  const [
    allRefunds,
    allChargebacks,
    allWithdrawals,
    allPaidCommissions,
    allPendingCommissions,
    allActivity,
  ] = await Promise.all(queries);

  // Filtrar apenas as transações solicitadas para exibição
  const refunds = includeRefunds ? allRefunds : [];
  const chargebacks = includeChargebacks ? allChargebacks : [];
  const withdrawals = includeWithdrawals ? allWithdrawals : [];
  const paidCommissions = includeCommissions ? allPaidCommissions : [];
  const pendingCommissions = includeCommissions ? allPendingCommissions : [];
  const activity = includeActivity ? allActivity : [];

  // Para cálculo do saldo, usar TODAS as transações
  const allTransactionsForBalance = [
    ...allRefunds,
    ...allChargebacks,
    ...allWithdrawals,
    ...allPaidCommissions,
    ...allPendingCommissions,
    ...allActivity,
  ];

  let initialBalance = 0;

  if (startDate) {
    const initialBalanceQueries = [];

    const initialPaidCommissionsWhere = {
      id_user,
      id_status: [
        findCommissionsStatus('released').id,
        findCommissionsStatus('waiting').id,
      ],
      ...createBeforeDateFilter('created_at'),
    };

    initialBalanceQueries.push(
      Commissions.sum('amount', {
        where: initialPaidCommissionsWhere,
      }),
    );

    const initialWithdrawalsWhere = {
      id_user,
      id_type: findTransactionTypeByKey('withdrawal').id,
      id_status: [
        findTransactionStatusByKey('pending').id,
        findTransactionStatusByKey('paid').id,
      ],
      ...createBeforeDateFilter('created_at'),
    };

    initialBalanceQueries.push(
      Transactions.sum('withdrawal_total', {
        where: initialWithdrawalsWhere,
      }),
    );

    const initialActivityWhere = {
      id_user,
      ...createBeforeDateFilter('created_at'),
    };

    initialBalanceQueries.push(
      User_activity.sum('amount', {
        where: initialActivityWhere,
      }),
    );

    const [initialPaidCommissions, totalWithdrawals, totalActivity] =
      await Promise.all(initialBalanceQueries);

    initialBalance =
      (initialPaidCommissions || 0) -
      (totalWithdrawals || 0) +
      (totalActivity || 0);

    for (const commission of [...allRefunds, ...allChargebacks]) {
      initialBalance += commission.amount;
    }
  }

  return {
    refunds: refunds.map((t) => t.toJSON()),
    chargebacks: chargebacks.map((t) => t.toJSON()),
    withdrawals: withdrawals.map((t) => t.toJSON()),
    commissions: paidCommissions.map((t) => t.toJSON()),
    pendingCommissions: pendingCommissions.map((t) => t.toJSON()),
    activity: activity.map((t) => t.toJSON()),
    allTransactionsForBalance: allTransactionsForBalance.map((t) => t.toJSON()),
    initialBalance,
  };
};

module.exports = {
  findTransactionChargeback,
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
  findStatementTransactions,
};
