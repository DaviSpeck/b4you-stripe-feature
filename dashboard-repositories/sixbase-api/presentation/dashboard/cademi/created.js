const { findIntegrationType } = require('../../../types/integrationTypes');

const serializeIntegration = (integration) => {
  const {
    uuid,
    id_plugin,
    settings: { webhook_url, name },
  } = integration;
  return {
    uuid,
    type: findIntegrationType(id_plugin).name,
    name,
    webhook_url,
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
