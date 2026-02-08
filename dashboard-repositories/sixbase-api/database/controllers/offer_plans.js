const OfferPlans = require('../models/Offer_plans');

const createOfferPlan = async (data) => OfferPlans.create(data);

const deleteOfferPlan = async (where) => OfferPlans.destroy({ where });

const findOneOfferPlan = async (where) => OfferPlans.findOne({ where });

module.exports = {
  createOfferPlan,
  deleteOfferPlan,
  findOneOfferPlan,
};
