const Charges = require('../models/Charges');
const Products = require('../models/Products');
const Sales = require('../models/Sales');
const Sales_items = require('../models/Sales_items');
const Users = require('../models/Users');
const { chargeStatus } = require('../../status/chargeStatus');
const rawData = require('../rawData');

const [, PAID] = chargeStatus;

const getAllChargesPaginated = async (where, page, size) => {
  const offset = page * size;
  const limit = Number(size);
  where.id_status = PAID.id;
  const charges = await Charges.findAndCountAll({
    nest: true,
    where,
    distinct: true,
    subQuery: false,
    order: [['id', 'desc']],
    include: [
      {
        model: Sales,
        as: 'sale',
        include: [
          {
            model: Sales_items,
            as: 'products',
            include: [
              {
                model: Products,
                as: 'product',
              },
            ],
          },
          {
            model: Users,
            as: 'user',
          },
        ],
      },
    ],
    offset,
    limit,
  });

  return charges;
};

const getAllChargesSubscriptionsPaginated = async (where, page, size) => {
  const offset = page * size;
  const limit = Number(size);
  const charges = await Charges.findAndCountAll({
    nest: true,
    where,
    distinct: true,
    subQuery: false,
    offset,
    limit,
  });

  return charges;
};

const createCharge = async (chargeObj, t = null) => {
  const charge = await Charges.create(
    chargeObj,
    t
      ? {
          transaction: t,
        }
      : null,
  );
  return charge;
};

const updateCharge = async (id, chargeObj, t = null) => {
  const charge = await Charges.update(chargeObj, {
    where: {
      id,
    },
    transaction: t,
  });
  return charge;
};

const findCharge = async (where) => {
  const charge = await Charges.findOne({
    raw: true,
    where,
  });

  return charge;
};

const findChargeSubscriptionRefund = async (where) => {
  const charges = await Charges.findOne({
    where,
    order: [['paid_at', 'DESC']],
  });

  return charges;
};

const updateChargeTransaction = async (data, where, t = null) =>
  Charges.update(data, { where, transaction: t });

const findAllCharges = async (where) => {
  const charges = await Charges.findAll({
    where,
  });

  return rawData(charges);
};

module.exports = {
  createCharge,
  findCharge,
  findChargeSubscriptionRefund,
  getAllChargesPaginated,
  getAllChargesSubscriptionsPaginated,
  updateCharge,
  updateChargeTransaction,
  findAllCharges,
};
