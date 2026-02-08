const serializeMemberkitPlugins = (plugin) => {
  const {
    settings: {
      api_key,
      name,
      send_invoice_customer_mail,
      issue_invoice,
      type,
      service_label,
      api_key_logistic,
    },
    uuid,
  } = plugin;
  return {
    uuid,
    settings: {
      api_key,
      api_key_logistic,
      name,
      send_invoice_customer_mail,
      issue_invoice,
      type,
      service_label,
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
      return this.data.map(serializeMemberkitPlugins);
    }
    return serializeMemberkitPlugins(this.data);
  }
};
