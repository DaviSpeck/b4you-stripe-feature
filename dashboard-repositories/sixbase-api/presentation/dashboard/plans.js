const { capitalizeName } = require('../../utils/formatters');

const serializeSinglePlan = (plan) => {
  const {
    uuid,
    label,
    price,
    frequency_label,
    subscription_fee,
    subscription_fee_price,
    charge_first,
  } = plan;

  return {
    uuid,
    label: capitalizeName(label),
    price,
    frequency_label: capitalizeName(frequency_label),
    subscription_fee,
    subscription_fee_price,
    charge_first,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSinglePlan);
    }
    return serializeSinglePlan(this.data);
  }
};
