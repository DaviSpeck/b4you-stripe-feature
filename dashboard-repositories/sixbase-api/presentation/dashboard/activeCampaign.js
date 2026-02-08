const { findIntegrationType } = require('../../types/integrationTypes');

const serializeActiveCampaign = (integration) => {
  const {
    uuid,
    id_plugin,
    settings: { name },
  } = integration;
  return {
    uuid,
    name,
    type: findIntegrationType(id_plugin).name,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeActiveCampaign);
    }
    return serializeActiveCampaign(this.data);
  }
};
