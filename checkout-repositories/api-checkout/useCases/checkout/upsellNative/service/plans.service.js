const { QueryTypes } = require('sequelize');
const { sequelize } = require('../../../../database/models');

const getPlansOffer = async ({ offer_uuid }) => {
  const plans = await sequelize.query(
    `
      SELECT 
        pp.uuid,
        pp.label,
        pp.price,
        pp.frequency_label,
        pp.subscription_fee,
        pp.subscription_fee_price,
        pp.charge_first,
        po.uuid as offer_uuid
      FROM offer_plans op
      INNER JOIN product_plans pp ON pp.id = op.id_plan
      INNER JOIN product_offer po ON po.id = op.id_offer
      WHERE po.uuid = :offer_uuid
    `,
    {
      replacements: { offer_uuid },
      type: QueryTypes.SELECT,
    }
  );

  return plans.map((plan) => ({
    uuid: plan.uuid,
    label: plan.label,
    description: plan.label,
    frequency_label: plan.frequency_label,
    frequency: plan.frequency_label,
    subscription_fee: Boolean(plan.subscription_fee),
    subscription_fee_price: Number(plan.subscription_fee_price),
    charge_first: Boolean(plan.charge_first),
    price: Number(plan.price),
    offer_uuid: plan.offer_uuid,
  }));
};

module.exports = { getPlansOffer };
