const serializeIntegrationLists = (list) => {
  const { id, name } = list;
  return {
    id,
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
      return this.data.map(serializeIntegrationLists);
    }
    return serializeIntegrationLists(this.data);
  }
};
