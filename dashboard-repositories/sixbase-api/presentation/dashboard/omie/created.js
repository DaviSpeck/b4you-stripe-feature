const { findIntegrationType } = require('../../../types/integrationTypes');

const serializeIntegration = (integration) => {
  const {
    uuid,
    id_plugin,
    settings: {
      app_key,
      app_secret,
      product_code_omie,
      payment_code_omie,
      category_code_omie,
      account_code_omie,
      scenario_code_omie,
    },
  } = integration;
  return {
    uuid,
    type: findIntegrationType(id_plugin).name,
    app_key,
    app_secret,
    product_code_omie,
    payment_code_omie,
    category_code_omie,
    account_code_omie,
    scenario_code_omie,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeIntegration);
    }
    return serializeIntegration(this.data);
  }
};
