const serializeIntegrationTags = (tags) => {
  const { id, tag } = tags;
  return {
    id,
    tag,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeIntegrationTags);
    }
    return serializeIntegrationTags(this.data);
  }
};
