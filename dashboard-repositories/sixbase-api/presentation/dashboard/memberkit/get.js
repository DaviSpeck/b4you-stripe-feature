const serializeMemberkitPlugins = (plugin) => {
  const {
    settings: { api_key, name },
    uuid,
    active,
  } = plugin;
  return {
    uuid,
    api_key,
    name,
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
      return this.data.map(serializeMemberkitPlugins);
    }
    return serializeMemberkitPlugins(this.data);
  }
};
