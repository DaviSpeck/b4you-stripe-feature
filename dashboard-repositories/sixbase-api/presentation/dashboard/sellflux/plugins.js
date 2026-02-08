const serializeSellFluxPlugins = (plugin) => {
  const {
    settings: { name, api_url_lead },
    uuid,
  } = plugin;
  return {
    uuid,
    name,
    api_url_lead,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSellFluxPlugins);
    }
    return serializeSellFluxPlugins(this.data);
  }
};
