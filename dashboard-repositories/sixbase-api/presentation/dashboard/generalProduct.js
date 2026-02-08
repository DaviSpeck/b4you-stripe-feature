const { resolveType } = require('../common');

const serializeSingleProduct = (product) => {
  const {
    uuid,
    name,
    id_type,
    payment_type,
    content_delivery,
    sales_page_url,
  } = product;
  return {
    uuid,
    name,
    type: resolveType(id_type),
    payment_type,
    content_delivery,
    sales_page_url,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleProduct);
    }
    return serializeSingleProduct(this.data);
  }
};
