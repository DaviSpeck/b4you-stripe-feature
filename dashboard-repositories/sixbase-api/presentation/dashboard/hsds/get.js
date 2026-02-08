const serializeHSDSPlugins = (plugin) => {
  const {
    settings: { api_key },
    uuid,
    active,
  } = plugin;
  return {
    uuid,
    api_key,
    active,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeHSDSPlugins);
    }
    return serializeHSDSPlugins(this.data);
  }
};
