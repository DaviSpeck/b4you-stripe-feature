const Coupons_sales = require('../models/Coupons_sales');

const createCouponSale = async (data, t = null) =>
  Coupons_sales.create(
    data,
    t
      ? {
          transaction: t,
        }
      : null,
  );

const findOneCouponSale = async (where) =>
  Coupons_sales.findOne({ where, raw: true });

const updateCouponSale = async (where, data) =>
  Coupons_sales.update(data, { where });

module.exports = {
  createCouponSale,
  findOneCouponSale,
  updateCouponSale,
};
