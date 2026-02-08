const { Op } = require('sequelize');
const Affiliates = require('../models/Affiliates');
const Coproductions = require('../models/Coproductions');
const Lessons = require('../models/Lessons');
const Modules = require('../models/Modules');
const Products = require('../models/Products');
const Sales_items = require('../models/Sales_items');
const Students = require('../models/Students');
const Study_history = require('../models/Study_history');
const Transaction = require('../models/Transactions');
const Transactions = require('../models/Transactions');
const Users = require('../models/Users');
const DateHelper = require('../../utils/helpers/date');
const {
  findTransactionType,
  findTransactionTypeByKey,
} = require('../../types/transactionTypes');
const { findCoproductionStatus } = require('../../status/coproductionsStatus');
const { DATABASE_DATE } = require('../../types/dateTypes');
const { DOCUMENT, ONLY_DIGITS } = require('../../utils/regex');
const { rolesTypes, findRoleTypeByKey } = require('../../types/roles');

const queryRole = (role) => {
  let roles = rolesTypes.map((r) => r.id);
  if (!role.producer) {
    roles = roles.filter((r) => r !== findRoleTypeByKey('producer').id);
  }

  if (!role.coproducer) {
    roles = roles.filter((r) => r !== findRoleTypeByKey('coproducer').id);
  }

  if (!role.affiliate) {
    roles = roles.filter((r) => r !== findRoleTypeByKey('affiliate').id);
  }
  return roles;
};

const formatWhere = ({
  endDate,
  id_status,
  input,
  paymentMethod,
  productUUID,
  startDate,
  trackingParameters,
}) => {
  let where = {};
  if (id_status) where.id_status = id_status;
  if (paymentMethod) where.payment_method = paymentMethod;
  if (productUUID) where = { ...where, '$product.uuid$': productUUID };
  if (startDate && endDate) {
    where.created_at = {
      [Op.between]: [
        DateHelper(startDate)
          .utcOffset(-3, true)
          .startOf('day')
          .utc()
          .format(DATABASE_DATE),
        DateHelper(endDate)
          .utcOffset(-3, true)
          .endOf('day')
          .utc()
          .format(DATABASE_DATE),
      ],
    };
  }
  if (input) {
    let orObject = {
      '$student.full_name$': { [Op.like]: `%${input}%` },
      '$student.email$': { [Op.like]: `%${input}%` },
      '$product.name$': { [Op.like]: `%${input}%` },
    };
    if (DOCUMENT.test(input)) {
      const sanitizedInput = input.replace(ONLY_DIGITS, '');
      if (sanitizedInput.length > 0) {
        orObject = {
          ...orObject,
          '$student.document_number$': { [Op.like]: `%${sanitizedInput}%` },
        };
      }
    }

    where = {
      ...where,
      [Op.or]: orObject,
    };
  }

  if (trackingParameters.src) where.src = trackingParameters.src;
  if (trackingParameters.sck) where.sck = trackingParameters.sck;
  if (trackingParameters.utm_source)
    where.utm_source = trackingParameters.utm_source;
  if (trackingParameters.utm_medium)
    where.utm_medium = trackingParameters.utm_medium;
  if (trackingParameters.utm_campaign)
    where.utm_campaign = trackingParameters.utm_campaign;
  if (trackingParameters.utm_content)
    where.utm_content = trackingParameters.utm_content;
  if (trackingParameters.utm_term) where.utm_term = trackingParameters.utm_term;
  return where;
};

const createSaleItem = async (saleObj, t = null) => {
  const sale_item = Sales_items.create(
    saleObj,
    t
      ? {
          transaction: t,
        }
      : null,
  );
  return sale_item;
};

const findStudentSalesItemsPaginated = async (where, page, limit) => {
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  const offset = page * limit;
  const salesItems = await Sales_items.findAndCountAll({
    nest: true,
    offset,
    limit,
    where,
    distinct: true,
    include: [
      {
        model: Products,
        as: 'product',
        include: [
          {
            model: Users,
            as: 'producer',
          },
          {
            model: Modules,
            as: 'module',
            include: [
              {
                model: Lessons,
                as: 'lesson',
                required: true,
                include: [
                  {
                    model: Study_history,
                    as: 'study_history',
                    where: {
                      id_student: where.id_student,
                    },
                    required: false,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
  return salesItems;
};

const findAllSalesItemsPaginated = async ({
  endDate,
  id_status,
  id_user,
  input,
  page,
  paymentMethod,
  productUUID,
  role,
  size,
  startDate,
  trackingParameters,
}) => {
  const offset = Number(page) * Number(size);
  const limit = Number(size);

  const where = formatWhere({
    endDate,
    id_status,
    id_user,
    input,
    paymentMethod,
    productUUID,
    role,
    startDate,
    trackingParameters,
  });
  const salesItems = await Sales_items.findAndCountAll({
    nest: true,
    distinct: true,
    subQuery: false,
    where,
    order: [['created_at', 'DESC']],
    offset,
    limit,
    group: ['id'],
    include: [
      { association: 'product', attributes: ['name'], paranoid: false },
      {
        association: 'student',
        attributes: ['full_name'],
      },
      {
        association: 'transactions',
        where: {
          id_type: findTransactionTypeByKey('commission').id,
          id_user,
          id_role: queryRole(role),
        },
        attributes: ['user_net_amount', 'id_status', 'id_role', 'id_user'],
      },
    ],
  });

  return {
    rows: salesItems.rows.map((r) => r.toJSON()),
    count: salesItems.count.length,
  };
};

const findAllSalesToExport = async ({
  endDate,
  id_status,
  id_user,
  input,
  paymentMethod,
  productUUID,
  role,
  startDate,
  trackingParameters,
}) => {
  const where = formatWhere({
    endDate,
    id_status,
    id_user,
    input,
    paymentMethod,
    productUUID,
    role,
    startDate,
    trackingParameters,
  });
  const salesItems = await Sales_items.findAll({
    nest: true,
    distinct: true,
    subQuery: false,
    where,
    order: [['created_at', 'DESC']],
    group: ['id'],
    include: [
      {
        association: 'sale',
        attributes: ['address'],
      },
      { association: 'product', attributes: ['name'], paranoid: false },
      {
        association: 'student',
        attributes: ['full_name', 'document_number', 'email'],
      },
      {
        association: 'transactions',
        where: {
          id_type: findTransactionTypeByKey('commission').id,
          id_user,
          id_role: queryRole(role),
        },
        attributes: ['user_net_amount', 'id_status', 'id_role', 'id_user'],
      },
    ],
  });

  return salesItems.map((s) => s.toJSON());
};

const findAllSalesItemsMetrics = async ({
  endDate,
  id_status,
  id_user,
  input,
  paymentMethod,
  productUUID,
  role,
  startDate,
  trackingParameters,
}) => {
  const where = formatWhere({
    endDate,
    id_status,
    id_user,
    input,
    paymentMethod,
    productUUID,
    role,
    startDate,
    trackingParameters,
  });
  const salesItems = await Sales_items.findAll({
    nest: true,
    distinct: true,
    subQuery: false,
    where,
    order: [['created_at', 'DESC']],
    group: ['id'],
    attributes: ['id_status', 'payment_method'],
    include: [
      {
        model: Students,
        as: 'student',
        attributes: ['uuid', 'full_name', 'email', 'profile_picture'],
      },
      {
        model: Products,
        as: 'product',
        paranoid: false,
        attributes: ['uuid', 'name'],
      },
      {
        model: Transaction,
        as: 'transactions',
        where: {
          id_type: findTransactionType('Comissão').id,
          id_user,
          id_role: queryRole(role),
        },
        attributes: ['user_net_amount'],
      },
    ],
  });
  return salesItems.map((s) => s.toJSON());
};

const findOneSaleItem = async (where) => {
  const salesItems = await Sales_items.findOne({
    nest: true,
    where,
    include: [
      {
        model: Students,
        as: 'student',
      },
      {
        association: 'refund',
        required: false,
      },
      {
        association: 'plan',
        paranoid: false,
      },
      {
        model: Transaction,
        as: 'transactions',
        required: false,
        include: [
          {
            model: Users,
            as: 'user',
          },
          {
            association: 'charge',
          },
        ],
      },
      {
        model: Products,
        as: 'product',
        paranoid: false,
        include: [
          {
            model: Users,
            as: 'producer',
          },
        ],
      },
    ],
  });
  return salesItems;
};

const updateSaleItem = async (data, where, t = null) =>
  Sales_items.update(data, { where, transaction: t });

const findMetricsByStatus = async (id_user, start_date, end_date) => {
  const salesItems = await Sales_items.findAll({
    nest: true,
    where: {
      created_at: {
        [Op.between]: [start_date, end_date],
      },
      '$product.id_user$': id_user,
    },
    include: [
      {
        model: Products,
        as: 'product',
      },
    ],
  });
  return salesItems;
};

const findAllSalesItems = async ({ id_user, start_date, end_date }) => {
  const where = {
    created_at: {
      [Op.between]: [start_date, end_date],
    },
    [Op.or]: {
      '$product.id_user$': id_user,
      '$transactions.id_user$': id_user,
    },
  };
  const salesItems = await Sales_items.findAll({
    nest: true,
    where,
    include: [
      {
        model: Products,
        as: 'product',
      },
      {
        model: Transactions,
        as: 'transactions',
      },
    ],
  });
  return salesItems;
};

const findSaleItem = async (where) => {
  const salesItems = await Sales_items.findOne({
    nest: true,
    where,
    include: [
      {
        association: 'student',
      },
      {
        association: 'affiliate',
        attributes: ['id_user'],
      },
      {
        association: 'product',
        attributes: ['id_user'],
      },
    ],
  });
  return salesItems;
};

const findNotificationSaleItem = async (where) =>
  Sales_items.findOne({
    where,
    nest: true,
    include: [
      {
        model: Products,
        as: 'product',
        include: [
          {
            model: Users,
            as: 'producer',
          },
          {
            model: Coproductions,
            as: 'coproductions',
            required: false,
            where: {
              status: findCoproductionStatus('Ativo').id,
            },
            include: [
              {
                model: Users,
                as: 'user',
              },
            ],
          },
        ],
      },
      {
        model: Affiliates,
        as: 'affiliate',
        include: [
          {
            model: Users,
            as: 'user',
          },
        ],
      },
      {
        association: 'transactions',
        where: {
          id_type: findTransactionTypeByKey('commission').id,
        },
      },
    ],
  });

const findAllSaleItemsWithProducts = async (where) => {
  const sale_items = await Sales_items.findAll({
    include: [
      {
        model: Products,
        as: 'product',
        attributes: ['warranty', 'name', 'support_email'],
        include: [
          {
            association: 'producer',
          },
        ],
      },
      {
        association: 'student',
      },
    ],
    where,
  });

  return sale_items;
};

const findOnlySaleItem = async (where) =>
  Sales_items.findOne({
    raw: true,
    where,
  });

const findSaleItemsBilletWorker = async (where) => {
  const sale_items = await Sales_items.findAll({
    include: [
      {
        association: 'transactions',
        required: true,
        include: [
          {
            association: 'charge',
            required: true,
            where: {
              due_date: { [Op.lte]: DateHelper().subtract(3, 'd') },
            },
          },
        ],
      },
    ],
    where,
    nest: true,
  });

  return sale_items;
};

const findStudentActivityPaginated = async (where, page, size) => {
  const limit = parseInt(size, 10);
  const offset = parseInt(page, 10) * limit;
  const sale_items = await Sales_items.findAndCountAll({
    where,
    limit,
    offset,
    order: [['id', 'desc']],
    attributes: ['warranty', 'name', 'support_email', 'cover'],
    include: [
      {
        association: 'producer',
      },
    ],
  });

  return sale_items;
};

const findSaleItemRefund = async (where) => {
  const salesItems = await Sales_items.findAll({
    nest: true,
    subQuery: false,
    where,
    include: [
      {
        model: Products,
        as: 'product',
        paranoid: false,
        include: [
          {
            model: Users,
            as: 'producer',
            include: [
              {
                association: 'user_sale_settings',
              },
            ],
          },
        ],
      },
      {
        association: 'affiliate',
        required: false,
        include: [
          {
            association: 'user',
            include: [
              {
                association: 'balance',
              },
            ],
          },
        ],
      },
      {
        model: Transaction,
        as: 'transactions',
        through: { attributes: [] },
        include: [
          {
            association: 'user',
            include: [
              {
                association: 'balance',
              },
            ],
          },
        ],
      },
      {
        association: 'student',
      },
    ],
  });
  return salesItems.length > 0 ? salesItems[0] : null;
};

const findSaleItemWithStudent = async (where) =>
  Sales_items.findOne({
    attributes: ['id', 'payment_method', 'id_sale'],
    where,
    nest: true,
    include: [
      {
        association: 'student',
        attributes: ['id', 'credit_card'],
      },
    ],
  });

const findSaleItemForWebhook = async (where) => {
  const saleItem = await Sales_items.findOne({
    where,
    nest: true,
    include: [
      {
        association: 'transactions',
        include: [
          {
            association: 'charge',
          },
          {
            association: 'user',
            attributes: ['email'],
          },
        ],
      },
      {
        association: 'product',
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
          },
        ],
      },
      {
        association: 'refund',
      },
    ],
  });

  if (saleItem) return saleItem.toJSON();
  return saleItem;
};
const findOneSaleItemStudentAccess = async (where) => {
  const salesItem = await Sales_items.findOne({
    nest: true,
    where,
    subQuery: false,
    include: [
      {
        model: Students,
        as: 'student',
      },
      {
        association: 'transactions',
      },
      {
        model: Products,
        as: 'product',
        include: [
          {
            model: Users,
            as: 'producer',
          },
        ],
      },
    ],
  });
  return salesItem ? salesItem.toJSON() : salesItem;
};

const findSalesItemsComplete = async (where) => {
  const saleItems = await Sales_items.findAll({
    where,
    include: [
      { association: 'product' },
      { required: false, association: 'plan' },
      { required: false, association: 'affiliate' },
      {
        association: 'transactions',
        required: false,
        include: [{ required: false, association: 'charge' }],
      },
      { required: false, association: 'subscription' },
      { required: false, association: 'refund' },
    ],
  });
  return saleItems;
};

const findConversion = async (where) => {
  const salesItems = await Sales_items.findAll({
    where,
    nest: true,
    raw: true,
    attributes: ['id_status', 'payment_method', 'id_student', 'id_product'],
  });
  return salesItems;
};

const findSaleItemInfo = async (where) => {
  const saleItem = await Sales_items.findOne({
    where,
    nest: true,
    include: [
      {
        association: 'charges',
        attributes: ['id', 'qrcode_url', 'price', 'pix_code'],
      },
      {
        association: 'student',
        attributes: ['full_name', 'email', 'whatsapp', 'document_number'],
      },
      {
        association: 'sale',
        attributes: ['address'],
      },
      {
        association: 'offer',
        attributes: ['uuid', 'name'],
      },
    ],
  });
  if (!saleItem) return null;
  return saleItem.toJSON();
};

module.exports = {
  createSaleItem,
  findAllSaleItemsWithProducts,
  findAllSalesItems,
  findAllSalesItemsMetrics,
  findAllSalesItemsPaginated,
  findMetricsByStatus,
  findNotificationSaleItem,
  findOneSaleItem,
  findOneSaleItemStudentAccess,
  findOnlySaleItem,
  findSaleItem,
  findSaleItemForWebhook,
  findSaleItemRefund,
  findSaleItemsBilletWorker,
  findSaleItemWithStudent,
  findSalesItemsComplete,
  findStudentActivityPaginated,
  findStudentSalesItemsPaginated,
  updateSaleItem,
  findConversion,
  findAllSalesToExport,
  findSaleItemInfo,
};
