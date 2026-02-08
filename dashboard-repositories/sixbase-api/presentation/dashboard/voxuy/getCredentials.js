const serializeLeadloversPlugin = (plugin) => {
  const {
    settings: { name, api_key, api_url },
    uuid,
  } = plugin;
  return {
    uuid,
    name,
    api_key,
    api_url,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeLeadloversPlugin);
    }
    return serializeLeadloversPlugin(this.data);
  }
};
