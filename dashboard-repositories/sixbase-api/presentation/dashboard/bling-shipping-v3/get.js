const serializeBlingPlugins = (plugin) => {
  const {
    settings: {
      nat_operacao,
      generate_invoice,
      shipping,
      shipping_service,
      issue_invoice,
    },
    uuid,
    active,
  } = plugin;
  return {
    uuid,
    active,
    nat_operacao,
    generate_invoice,
    shipping,
    shipping_service,
    issue_invoice,
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
