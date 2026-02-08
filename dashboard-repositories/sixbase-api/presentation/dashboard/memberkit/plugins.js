const serializeMemberkitPlugins = (plugin) => {
  const { data, uuid, product } = plugin;
  return {
    uuid,
    data,
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
      return this.data.map(serializeMemberkitPlugins);
    }
    return serializeMemberkitPlugins(this.data);
  }
};
