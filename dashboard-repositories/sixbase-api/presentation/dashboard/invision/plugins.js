const serializeInvisionPlugins = (plugin) => {
  const {
    settings: { name_list_primary, name_list_secondary },
    uuid,
    product,
  } = plugin;
  return {
    uuid,
    name_list_primary,
    name_list_secondary,
    product,
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
