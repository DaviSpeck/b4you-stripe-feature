const serializeLeadloversPlugin = (plugin) => {
  const {
    settings: { name },
    uuid,
  } = plugin;
  return {
    uuid,
    name,
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
