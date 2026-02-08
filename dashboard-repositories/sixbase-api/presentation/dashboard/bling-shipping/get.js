const serializeBlingPlugins = (plugin) => {
  const {
    settings: {
      api_key,
      nat_operacao,
      generate_invoice,
      shipping,
      shipping_service,
    },
    uuid,
    active,
    verified,
  } = plugin;
  return {
    uuid,
    api_key,
    active,
    verified,
    nat_operacao,
    generate_invoice,
    shipping,
    shipping_service,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeBlingPlugins);
    }
    return serializeBlingPlugins(this.data);
  }
};
