const { Op } = require('sequelize');
const Affiliates = require('../models/Affiliates');
const Coproductions = require('../models/Coproductions');
const Lessons = require('../models/Lessons');
const Modules = require('../models/Modules');
const Products = require('../models/Products');
const Sales_items = require('../models/Sales_items');
const Students = require('../models/Students');
const Study_history = require('../models/Study_history');
const Transactions = require('../models/Transactions');
const Users = require('../models/Users');
const DateHelper = require('../../utils/helpers/date');
const { findTransactionTypeByKey } = require('../../types/transactionTypes');
const { findCoproductionStatus } = require('../../status/coproductionsStatus');
const { DATABASE_DATE } = require('../../types/dateTypes');
const { DOCUMENT } = require('../../utils/regex');
const { rolesTypes, findRoleTypeByKey } = require('../../types/roles');
const Coupons = require('../models/Coupons');

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

  if (!role.supplier) {
    roles = roles.filter((r) => r !== findRoleTypeByKey('supplier').id);
  }
  return roles;
};

const formatWhere = ({
  endDate,
  id_status,
  input,
  paymentMethod,
  productID,
  startDate,
  trackingParameters,
  affiliates,
  offers,
  tracking_code,
}) => {
  let where = {};
  if (id_status) where.id_status = id_status;
  if (paymentMethod) where.payment_method = paymentMethod;
  if (tracking_code) where.tracking_code = { [Op.or]: [null, ''] };
  if (offers) where.id_offer = offers.split(',');
  if (productID) {
    productID = productID.split(',');
    where = {
      ...where,
      id_product: {
        [Op.in]: productID,
      },
    };
  }
  if (affiliates && affiliates[0] === 'all-affiliates') {
    where = {
      ...where,
      id_affiliate: {
        [Op.ne]: null,
      },
    };
  } else if (affiliates && affiliates[0] === 'not-affiliates') {
    where = {
      ...where,
      id_affiliate: {
        [Op.eq]: null,
      },
    };
  } else if (affiliates && affiliates.length > 0) {
    where = {
      ...where,
      '$affiliate.id_user$': {
        [Op.in]: affiliates.map((a) => +a),
      },
    };
  }

  let dates = {};

  if (startDate && endDate) {
    dates = {
      [Op.or]: {
        paid_at: {
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
        created_at: {
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
      },
    };
  }

  let orObject = {};
  orObject = {
    ...dates,
  };

  if (input) {
    let oror = {
      uuid: { [Op.like]: `%${input}%` },
      '$sale.uuid$': { [Op.like]: `%${input}%` },
      '$sale.full_name$': { [Op.like]: `%${input}%` },
      '$sale.email$': { [Op.like]: `%${input}%` },
      '$product.name$': { [Op.like]: `%${input}%` },
    };
    if (DOCUMENT.test(input)) {
      const sanitizedInput = input.replace(/\D/g, '');
      if (sanitizedInput.length > 0) {
        oror = {
          ...oror,
          '$sale.document_number$': { [Op.like]: `%${sanitizedInput}%` },
        };
      }
    }

    orObject = {
      ...dates,
      [Op.and]: {
        [Op.or]: oror,
      },
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

  where = {
    list: true,
    ...where,
    ...orObject,
  };
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
  productID,
  role,
  size,
  startDate,
  trackingParameters,
  affiliates,
  offers,
  coupons,
  uuid_sale_item = null,
  tracking_code,
}) => {
  const offset = Number(page) * Number(size);
  const limit = Number(size);
  let salesItems = null;

  if (!uuid_sale_item) {
    const where = formatWhere({
      endDate,
      id_status,
      input,
      paymentMethod,
      productID,
      role,
      startDate,
      trackingParameters,
      affiliates,
      offers,
      tracking_code,
    });

    if (coupons) {
      if (coupons === 'all') {
        where['$coupon_sale.id_coupon$'] = {
          [Op.ne]: null,
        };
      } else {
        let cp = await Coupons.findAll({
          raw: true,
          paranoid: false,
          where: {
            coupon: coupons,
          },
          attributes: ['id'],
        });

        cp = cp.map((c) => c.id);
        where['$coupon_sale.id_coupon$'] = {
          [Op.in]: cp,
        };
      }
    }

    const { _created_at, ...rest } = where;

    salesItems = await Sales_items.findAndCountAll({
      nest: true,
      logging: true,
      distinct: true,
      subQuery: false,
      where: rest,
      order: [['created_at', 'DESC']],
      offset,
      limit,
      group: [['id']],
      attributes: [
        'id_sale',
        'created_at',
        'uuid',
        'id',
        'id_status',
        'price_product',
        'type',
        'payment_method',
        'src',
        'sck',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'id_affiliate',
      ],
      include: [
        { association: 'product', attributes: ['name'], paranoid: false },
        {
          association: 'sale',
          attributes: ['full_name', 'document_number', 'email', 'uuid'],
        },
        {
          association: 'commissions',
          attributes: ['id_status', 'id_role', 'amount', 'id_user'],
          where: {
            id_role: queryRole(role),
            id_user,
          },
        },
        {
          association: 'affiliate',
          attributes: ['uuid', 'id_user', 'id'],
          include: [{ association: 'user', attributes: ['full_name'] }],
        },
        {
          association: 'coupon_sale',
          attributes: ['id_coupon', 'id_sale'],
          include: [
            {
              association: 'coupons_sales',
              attributes: ['coupon'],
              paranoid: false,
            },
          ],
        },
      ],
    });
  } else {
    salesItems = await Sales_items.findAndCountAll({
      nest: true,
      logging: true,
      distinct: true,
      subQuery: false,
      where: { uuid: uuid_sale_item },
      order: [['created_at', 'DESC']],
      offset,
      limit,
      group: [['id']],
      attributes: [
        'id_sale',
        'created_at',
        'uuid',
        'id',
        'id_status',
        'price_product',
        'type',
        'payment_method',
        'src',
        'sck',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'id_affiliate',
      ],
      include: [
        { association: 'product', attributes: ['name'], paranoid: false },
        {
          association: 'sale',
          attributes: ['full_name', 'document_number', 'email'],
        },
        {
          association: 'commissions',
          attributes: ['id_status', 'id_role', 'amount', 'id_user'],
          where: {
            id_role: queryRole(role),
            id_user,
          },
        },
        {
          association: 'affiliate',
          attributes: ['uuid', 'id_user', 'id'],
          include: [{ association: 'user', attributes: ['full_name'] }],
        },
        {
          association: 'coupon_sale',
          attributes: ['id_coupon', 'id_sale'],
          include: [
            {
              association: 'coupons_sales',
              attributes: ['coupon'],
              paranoid: false,
            },
          ],
        },
      ],
    });
  }

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

const formatWhereMetrics = ({
  endDate,
  id_status,
  input,
  paymentMethod,
  productID,
  startDate,
  trackingParameters,
  affiliates,
  offers,
  tracking_code,
}) => {
  let where = {};
  if (id_status) where.id_status = id_status;
  if (paymentMethod) where.payment_method = paymentMethod;
  if (offers) where.id_offer = offers.split(',');
  if (tracking_code) where.tracking_code = { [Op.or]: [null, ''] };
  if (productID) {
    productID = productID.split(',');
    where = {
      ...where,
      id_product: {
        [Op.in]: productID,
      },
    };
  }
  if (affiliates && affiliates[0] === 'all-affiliates') {
    where = {
      ...where,
      id_affiliate: {
        [Op.ne]: null,
      },
    };
  } else if (affiliates && affiliates[0] === 'not-affiliates') {
    where = {
      ...where,
      id_affiliate: {
        [Op.eq]: null,
      },
    };
  } else if (affiliates && affiliates.length > 0) {
    where = {
      ...where,
      '$affiliate.id_user$': {
        [Op.in]: affiliates.map((a) => +a),
      },
    };
  }

  let dates = {};

  if (startDate && endDate) {
    dates = {
      [Op.or]: {
        paid_at: {
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
        created_at: {
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
      },
    };
  }

  let orObject = {};
  orObject = {
    ...dates,
  };

  if (input) {
    let oror = {
      uuid: { [Op.like]: `%${input}%` },
      '$sale.uuid$': { [Op.like]: `%${input}%` },
      '$sale.full_name$': { [Op.like]: `%${input}%` },
      '$sale.email$': { [Op.like]: `%${input}%` },
      '$product.name$': { [Op.like]: `%${input}%` },
    };
    if (DOCUMENT.test(input)) {
      const sanitizedInput = input.replace(/\D/g, '');
      if (sanitizedInput.length > 0) {
        oror = {
          ...oror,
          '$sale.document_number$': { [Op.like]: `%${sanitizedInput}%` },
        };
      }
    }

    orObject = {
      ...dates,
      [Op.and]: {
        [Op.or]: oror,
      },
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

  where = {
    list: true,
    ...where,
    ...orObject,
  };
  return where;
};

const findAllSalesItemsMetrics = async ({
  endDate,
  id_status,
  id_user,
  input,
  paymentMethod,
  productID,
  role,
  startDate,
  trackingParameters,
  affiliates,
  coupons,
  offers,
  tracking_code,
}) => {
  const where = formatWhereMetrics({
    endDate,
    id_status,
    id_user,
    input,
    paymentMethod,
    productID,
    role,
    startDate,
    trackingParameters,
    affiliates,
    offers,
    tracking_code,
  });

  if (coupons) {
    if (coupons === 'all') {
      where['$coupon_sale.id_coupon$'] = {
        [Op.ne]: null,
      };
    } else {
      let cp = await Coupons.findAll({
        raw: true,
        paranoid: false,
        where: {
          coupon: coupons,
        },
        attributes: ['id'],
      });

      cp = cp.map((c) => c.id);
      where['$coupon_sale.id_coupon$'] = {
        [Op.in]: cp,
      };
    }
  }

  const salesItems = await Sales_items.findAll({
    nest: true,
    distinct: true,
    subQuery: false,
    where,
    order: [['created_at', 'DESC']],
    group: ['id'],
    attributes: ['price_product', 'id_status', 'payment_method', 'paid_at'],
    include: [
      { association: 'coupon_sale', attributes: ['id_coupon'] },
      { association: 'product', attributes: ['name'], paranoid: false },
      {
        association: 'commissions',
        where: { id_role: queryRole(role), id_user },
        attributes: ['amount'],
      },
      { association: 'affiliate', attributes: ['uuid', 'id_user'] },
      {
        association: 'sale',
        attributes: ['full_name', 'document_number', 'email'],
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
        association: 'coupon_sale',
        required: false,
        include: [
          {
            association: 'coupons_sales',
            required: false,
            attributes: ['coupon', 'percentage'],
          },
        ],
      },
      {
        association: 'offer',
        required: false,
        paranoid: false,
        attributes: ['name'],
      },
      {
        association: 'sale',
        attributes: [
          'full_name',
          'document_number',
          'whatsapp',
          'email',
          'address',
        ],
      },
      {
        association: 'student',
        attributes: [
          'id',
          'email',
          'full_name',
          'document_number',
          'whatsapp',
          'bank_code',
          'account_agency',
          'account_number',
        ],
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
        association: 'transactions',
        required: false,
        include: [
          {
            association: 'user',
          },
          {
            association: 'charge',
          },
        ],
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
        model: Students,
        as: 'student',
      },
      {
        association: 'affiliate',
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
  const saleItem = await Sales_items.findOne({
    nest: true,
    where,
    attributes: [
      'id',
      'id_student',
      'paid_at',
      'price',
      'payment_method',
      'valid_refund_until',
      'price_base',
      'price_total',
      'id_offer',
      'fee_total',
      'uuid',
      'credit_card',
      'created_at',
      'id_sale',
    ],
    include: [
      {
        association: 'sale',
        attributes: ['full_name', 'email', 'document_number'],
      },
      {
        association: 'product',
        paranoid: false,
        attributes: [
          'id_user',
          'name',
          'payment_type',
          'content_delivery',
          'refund_email',
        ],
      },
      { association: 'commissions' },
      {
        association: 'charges',
        attributes: [
          'uuid',
          'provider_id',
          'provider',
          'id',
          'price',
          'paid_at',
          'installments',
          'updated_at',
          'payment_method',
        ],
      },
    ],
  });
  if (!saleItem) return null;
  return saleItem.toJSON();
};

const findSaleItemWithStudent = async (where) =>
  Sales_items.findOne({
    where,
    nest: true,
    include: [
      {
        association: 'student',
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
    include: [{ association: 'product', attributes: ['uuid'] }],
  });
  return salesItems;
};

const findSaleItemInfo = async (where) => {
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
        ],
      },
    ],
  });
  if (!saleItem) return null;
  return saleItem.toJSON();
};

const findSaleItemSale = async (where) => {
  const saleItem = await Sales_items.findOne({
    nest: true,
    subQuery: false,
    where,
    attributes: [
      'id',
      'id_student',
      'paid_at',
      'price',
      'payment_method',
      'valid_refund_until',
      'price_base',
      'price_total',
      'id_offer',
      'fee_total',
      'id_sale',
    ],
    include: [
      {
        association: 'sale',
        required: false, // ou true se quiser garantir que sempre tenha venda
        paranoid: false,
        attributes: ['id_user', 'id_order_tiny'],
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
  findSaleItemSale,
};
