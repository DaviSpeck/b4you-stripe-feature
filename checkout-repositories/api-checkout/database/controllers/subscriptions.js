const { Op } = require('sequelize');
const Charges = require('../models/Charges');
const Plan = require('../models/Product_plans');
const Product = require('../models/Products');
const Student = require('../models/Students');
const Subscriptions = require('../models/Subscriptions');
const Users = require('../models/Users');
const { DATABASE_DATE } = require('../../types/dateTypes');
const DateHelper = require('../../utils/helpers/date');
const {
  findSubscriptionStatusByKey,
} = require('../../status/subscriptionsStatus');

const findAllSubscriptionsPaginated = async (where, page = 0, size = 10) => {
  const offset = page * size;
  const limit = Number(size);
  const subscription = await Subscriptions.findAndCountAll({
    nest: true,
    where,
    order: [['created_at', 'DESC']],
    group: ['id'],
    include: [
      {
        model: Product,
        as: 'product',
        paranoid: false,
        attributes: ['uuid', 'name', 'cover', 'cover_key', 'nickname'],
        include: [
          {
            model: Users,
            as: 'producer',
          },
        ],
      },
      {
        model: Plan,
        as: 'plan',
        paranoid: false,
      },
      {
        model: Student,
        as: 'student',
      },
    ],
    offset,
    limit,
  });
  return { rows: subscription.rows, count: subscription.count.length };
};

const createSubscription = async (subscriptionObj, t = null) => {
  const subscription = await Subscriptions.create(subscriptionObj, {
    transaction: t,
  });
  return subscription;
};

const findAllSubscriptions = async (where) =>
  Subscriptions.findAll({
    where,
    include: [
      {
        model: Plan,
        as: 'plan',
        paranoid: false,
      },
      {
        model: Student,
        as: 'student',
      },
      {
        model: Product,
        as: 'product',
      },
    ],
  });

const findAllSubscriptionsToCharge = async (where) =>
  Subscriptions.findAll({
    where,
    nest: true,
    include: [
      {
        model: Plan,
        as: 'plan',
        paranoid: false,
      },
      {
        model: Student,
        as: 'student',
      },
      {
        model: Product,
        as: 'product',
        include: [
          {
            association: 'producer',
          },
        ],
      },
      {
        model: Charges,
        as: 'charges',
        limit: 1,
        order: [['paid_at', 'DESC']],
      },
      {
        association: 'sale_item',
      },
    ],
  });

const findOneSubscription = async (where, t = null) =>
  Subscriptions.findOne({
    where,
    transaction: t,
    include: [
      {
        association: 'product',
        include: [
          {
            association: 'producer',
          },
        ],
      },
      { association: 'student' },
      { association: 'plan' },
      {
        model: Charges,
        as: 'charges',
        limit: 1,
        order: [['paid_at', 'DESC']],
      },
      {
        association: 'sale_item',
      },
    ],
  });

const findSubscriptionCharge = async (where) =>
  Subscriptions.findOne({
    where,
    include: [
      {
        model: Plan,
        as: 'plan',
        paranoid: false,
      },
      {
        model: Student,
        as: 'student',
      },
      {
        model: Product,
        as: 'product',
      },
    ],
  });

const updateSubscription = async (where, data, t = null) =>
  Subscriptions.update(data, { where, transaction: t });

const findAllSubscriptionsFiltered = async ({
  end_date,
  id_status,
  id_user,
  input,
  next_charge,
  page,
  plan_uuid,
  product_uuid,
  size,
  start_date,
}) => {
  const offset = Number(page) * Number(size);
  const limit = Number(size);
  let where = { id_user };
  if (id_status) where.id_status = id_status;
  if (product_uuid) where = { ...where, '$product.uuid$': product_uuid };
  if (plan_uuid) where = { ...where, '$plan.uuid$': plan_uuid };
  if (start_date && end_date) {
    if (!next_charge) {
      where.created_at = {
        [Op.between]: [
          DateHelper(start_date).startOf('day').format(DATABASE_DATE),
          DateHelper(end_date).endOf('day').format(DATABASE_DATE),
        ],
      };
    } else {
      where.next_charge = {
        [Op.between]: [
          DateHelper(start_date).startOf('day').format(DATABASE_DATE),
          DateHelper(end_date).endOf('day').format(DATABASE_DATE),
        ],
      };
    }
  }

  if (input) {
    const rawInput = input.replace(/[^\d]/g, '');
    where = {
      ...where,
      [Op.or]: {
        '$student.full_name$': { [Op.like]: `%${input}%` },
        '$student.document_number$': { [Op.like]: `%${rawInput}%` },
        '$student.email$': { [Op.like]: `%${input}%` },
      },
    };
  }

  const subscription = await Subscriptions.findAndCountAll({
    nest: true,
    where,
    include: [
      {
        model: Product,
        as: 'product',
        paranoid: false,
        attributes: ['uuid', 'name', 'cover', 'cover_key'],
        include: [
          {
            model: Users,
            as: 'producer',
          },
        ],
      },
      {
        model: Plan,
        as: 'plan',
        paranoid: false,
      },
      {
        model: Student,
        as: 'student',
      },
    ],
    offset,
    limit,
    order: [['id', 'desc']],
  });
  return subscription;
};

const findSubscriptionRenew = async ({ uuid }) =>
  Subscriptions.findOne({
    nest: true,
    where: {
      uuid,
      id_status: findSubscriptionStatusByKey('active').id,
      valid_until: null,
      payment_method: { [Op.ne]: 'card' },
      renew: true,
    },
    include: [
      {
        association: 'plan',
        paranoid: false,
      },
      {
        association: 'student',
      },
      {
        association: 'product',
        include: [
          {
            association: 'producer',
          },
        ],
      },
    ],
  });

module.exports = {
  createSubscription,
  findAllSubscriptions,
  findAllSubscriptionsFiltered,
  findAllSubscriptionsPaginated,
  findAllSubscriptionsToCharge,
  findOneSubscription,
  findSubscriptionCharge,
  updateSubscription,
  findSubscriptionRenew,
};
