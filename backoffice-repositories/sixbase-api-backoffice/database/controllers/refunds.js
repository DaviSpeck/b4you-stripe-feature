const Refunds = require('../models/Refunds');

module.exports.findOneRefund = async (where) =>
  Refunds.findOne({
    nest: true,
    where,
    include: [
      {
        association: 'student',
      },
      {
        association: 'sale_item',
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

module.exports.createRefund = async (refundData, t = null) =>
  Refunds.create(
    refundData,
    t
      ? {
        transaction: t,
      }
      : null,
  );
