const { capitalizeName } = require('../../../utils/formatters');
const { findRulesTypes } = require('../../../types/integrationRulesTypes');

const serializeProduct = (product) => {
  if (!product) return null;
  const { uuid, name } = product;
  return {
    uuid,
    name: capitalizeName(name),
  };
};

const serializeSingleWebhook = (webhook) => {
  const {
    name,
    url,
    token,
    uuid,
    events,
    product,
    invalid,
    is_affiliate,
    id,
    is_supplier,
  } = webhook;
  const eventsArray = events.split(',');
  return {
    id,
    name,
    url,
    token,
    uuid,
    product: serializeProduct(product),
    events: eventsArray.map((event) => findRulesTypes(Number(event))),
    invalid,
    is_affiliate,
    is_supplier,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleWebhook);
    }
    return serializeSingleWebhook(this.data);
  }
};
