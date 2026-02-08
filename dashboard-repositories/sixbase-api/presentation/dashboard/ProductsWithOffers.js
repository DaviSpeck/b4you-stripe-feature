const { capitalizeName } = require('../../utils/formatters');
const { PHYSICAL_TYPE } = require('../../types/productTypes');

const serializePlans = (plans) => {
  if (!plans || !Array.isArray(plans) || plans.length === 0) return [];
  return plans.map(({ uuid, label, price, frequency_label }) => ({
    uuid,
    label,
    price,
    frequency_label: capitalizeName(frequency_label),
  }));
};

const serializeOffers = (offers) =>
  offers.map(({ id, uuid, name, price, plans, quantity }) => ({
    id,
    uuid,
    label: name,
    price,
    plans: serializePlans(plans),
    quantity,
  }));

const serializeSingleProductWithOffers = ({
  id,
  uuid,
  name,
  product_offer,
  payment_type,
  id_type,
  cover,
}) => ({
  id,
  uuid,
  name,
  payment_type,
  offers: serializeOffers(product_offer),
  physical_type: id_type === PHYSICAL_TYPE,
  cover,
});

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleProductWithOffers);
    }
    return serializeSingleProductWithOffers(this.data);
  }
};
