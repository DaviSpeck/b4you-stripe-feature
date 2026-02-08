const { fn, col } = require('sequelize');
const Coupons = require('../models/Coupons');
const Coupons_product_offers = require('../models/Coupons_product_offers');

const createCoupon = async (data) => Coupons.create(data);

const defaultOffersInclude = {
  association: 'offers',
  attributes: ['id'],
  through: { attributes: [] },
};

const toPlainCoupon = (couponInstance) => {
  if (!couponInstance) return null;

  const plain = couponInstance.get({ plain: true });
  if (Array.isArray(plain.offers)) {
    plain.offers = plain.offers.map(({ id }) => ({ id }));
  } else {
    plain.offers = [];
  }

  return plain;
};

const findOneCoupon = async (where, options = {}) => {
  const { include: customInclude = [], ...restOptions } = options;
  let includeList = [];
  if (Array.isArray(customInclude)) {
    includeList = [...customInclude];
  } else if (customInclude) {
    includeList = [customInclude];
  }

  const hasOffersInclude = includeList.some((item) => {
    const target = item?.association || item?.as;
    return target === 'offers';
  });

  if (!hasOffersInclude) {
    includeList.push(defaultOffersInclude);
  }

  const coupon = await Coupons.findOne({
    subQuery: false,
    where,
    ...restOptions,
    include: includeList,
  });
  let couponSales = null;
  const returnData = coupon ? toPlainCoupon(coupon) : null;

  if (coupon && coupon.offers.length !== 0) {
    couponSales = await Coupons_product_offers.findAll({
      raw: true,
      where: {
        id_coupon: coupon.id,
      },
    });
    if (couponSales && couponSales.length > 0) {
      returnData.offers = couponSales.map((e) => ({
        id: e.id_offer,
      }));
    }
  }

  return returnData;
};

const findCouponsPaginated = async (where, page, size) => {
  const offset = page * size;
  const limit = Number(size);
  const coupons = await Coupons.findAndCountAll({
    where,
    subQuery: false,
    offset,
    limit,
    distinct: true,
    attributes: {
      include: [
        [fn('COUNT', col('coupons_sales.id_coupon')), 'count_coupons_sales'],
      ],
    },
    include: [
      {
        association: 'coupons_sales',
        attributes: [],
      },
      defaultOffersInclude,
    ],
    group: ['coupons.id'],
  });
  return coupons;
};

const updateCoupon = async (where, data) => Coupons.update(data, { where });

/**
 * @param {Object} where Ex: {id: cart.id}
 * @param {Boolean} force Soft delete = false, Hard delete = true
 */
const deleteCoupon = async (where, force = false) =>
  Coupons.destroy({ where, force });

module.exports = {
  createCoupon,
  deleteCoupon,
  findOneCoupon,
  findCouponsPaginated,
  updateCoupon,
};
