const serializeInvisionPlugins = (plugin) => {
  const {
    settings: { api_key, api_url },
    uuid,
    active,
  } = plugin;
  return {
    uuid,
    api_key,
    api_url,
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
      return this.data.map(serializeInvisionPlugins);
    }
    return serializeInvisionPlugins(this.data);
  }
};
