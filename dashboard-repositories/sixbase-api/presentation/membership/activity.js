const { capitalizeName } = require('../../utils/formatters');

const serializeSingleSaleItem = (saleItem) => {
  const {
    uuid,
    net_amount_student,
    paid_at,
    product: { name, producer, cover },
  } = saleItem;

  return {
    uuid,
    price: net_amount_student,
    paid_at,
    producer: `${producer.first_name} ${producer.last_name}`,
    product: {
      name: capitalizeName(name),
      cover,
    },
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleSaleItem);
    }
    return serializeSingleSaleItem(this.data);
  }
};
