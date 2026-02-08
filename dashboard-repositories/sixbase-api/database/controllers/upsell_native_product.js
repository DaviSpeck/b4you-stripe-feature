const Upsell_native_product = require('../models/Upsell_native_product');

const createUpsellNativeProduct = async (data) => {
  const res = await Upsell_native_product.create(data);
  return res;
};

const updateUpsellNativeProduct = async (where, data) => {
  const res = await Upsell_native_product.update(data, { where });
  return res;
};

const findOneUpsellNativeProduct = async (where) => {
  const res = await Upsell_native_product.findOne({ where, raw: true });
  return res;
};

const findManyUpsellNativeProduct = async (where) => {
  const res = await Upsell_native_product.findAll({ where });
  return res;
};

module.exports = {
  createUpsellNativeProduct,
  updateUpsellNativeProduct,
  findOneUpsellNativeProduct,
  findManyUpsellNativeProduct,
};
