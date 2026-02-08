const serializeHotzapp = (plugin) => {
  const {
    settings: { url, allProducts, product_id, product_name, product_uuid },
    uuid,
  } = plugin;
  return {
    uuid,
    url,
    allProducts,
    product: {
      product_uuid,
      product_id,
      product_name,
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
      return this.data.map(serializeHotzapp);
    }
    return serializeHotzapp(this.data);
  }
};
