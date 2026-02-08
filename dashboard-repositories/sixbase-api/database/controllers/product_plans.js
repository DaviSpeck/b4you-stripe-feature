const Product_plans = require('../models/Product_plans');
const Products = require('../models/Products');

const createProductPlan = async (data) => Product_plans.create(data);

const findAllPlans = async (where) =>
  Product_plans.findAll({
    raw: true,
    attributes: [
      'uuid',
      'label',
      'price',
      'frequency_label',
      'subscription_fee',
      'subscription_fee_price',
      'charge_first',
    ],
    where,
    group: ['id'],
  });

const findOnePlan = async (where) =>
  Product_plans.findOne({
    where,
  });

const findAllSubscriptionPlans = async (id_user) => {
  const plans = await Product_plans.findAll({
    nest: true,
    attributes: [
      'uuid',
      'price',
      'label',
      'payment_frequency',
      'frequency_quantity',
      'frequency_label',
    ],
    include: [
      {
        model: Products,
        as: 'product',
        attributes: ['name', 'uuid'],
        where: { id_user },
      },
    ],
  });
  return plans;
};

const deletePlan = async (where) => Product_plans.destroy({ where });

module.exports = {
  createProductPlan,
  findAllPlans,
  findAllSubscriptionPlans,
  findOnePlan,
  deletePlan,
};
