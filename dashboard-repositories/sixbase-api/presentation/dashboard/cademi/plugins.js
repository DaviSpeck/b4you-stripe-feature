const serializeCademiPlugins = (plugin) => {
  const {
    settings: { name, webhook_url },
    uuid,
  } = plugin;
  return {
    uuid,
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
      return this.data.map(serializeCademiPlugins);
    }
    return serializeCademiPlugins(this.data);
  }
};
