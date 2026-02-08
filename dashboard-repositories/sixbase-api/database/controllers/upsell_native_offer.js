const Upsell_native_offer = require('../models/Upsell_native_offer');

const createUpsellNativeOffer = async (data) => {
  const res = await Upsell_native_offer.create(data);
  return res.get({ plain: true });
};

const updateUpsellNativeOffer = async (where, data) => {
  const res = await Upsell_native_offer.update(data, { where });
  return res;
};

const findOneUpsellNativeOffer = async (where) => {
  const res = await Upsell_native_offer.findOne({ where, raw: true });
  return res;
};

const findManyUpsellNativeOffer = async (where) => {
  const res = await Upsell_native_offer.findAll({ where });
  return res;
};

module.exports = {
  createUpsellNativeOffer,
  updateUpsellNativeOffer,
  findOneUpsellNativeOffer,
  findManyUpsellNativeOffer,
};
