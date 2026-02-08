const Refunds = require('../models/Refunds');
const Sales_items = require('../models/Sales_items');
const Students = require('../models/Students');

const createRefund = async (refundData, t = null) =>
  Refunds.create(
    refundData,
    t
      ? {
          transaction: t,
        }
      : null,
  );

const findAllRefunds = async (where) =>
  Refunds.findAll({
    raw: true,
    where,
  });

const findLastRefund = async (where) =>
  Refunds.findOne({
    order: [['id', 'DESC']],
    limit: 1,
    raw: true,
    where,
  });

const findOneRefund = async (where) =>
  Refunds.findOne({
    nest: true,
    where,
    include: [
      {
        model: Students,
        as: 'student',
      },
      {
        model: Sales_items,
        as: 'sale_item',
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

const updateRefund = async (data, where, t = null) => {
  const refund = await Refunds.update(
    data,
    {
      where,
    },
    t
      ? {
          transaction: t,
        }
      : null,
  );
  return refund;
};

module.exports = {
  createRefund,
  findAllRefunds,
  findOneRefund,
  updateRefund,
  findLastRefund,
};
