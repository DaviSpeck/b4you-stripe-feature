const { resolveType } = require('../common');
const { slugify } = require('../../utils/formatters');

const serializeSingleProduct = (product) => {
  const { uuid, name, id_type, payment_type, id } = product;
  return {
    uuid,
    name,
    slug: slugify(name),
    type: resolveType(id_type),
    payment_type,
    id,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map((data) => serializeSingleProduct(data));
    }
    return serializeSingleProduct(this.data);
  }
};
