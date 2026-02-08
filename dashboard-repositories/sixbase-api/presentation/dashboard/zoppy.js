const serializeZoppy = (integration) => {
  const {
    id,
    id_plugin,
    settings: { apiKey, status },
  } = integration;
  return {
    id,
    id_plugin,
    apiKey,
    status: Number(status) === 1 ? 'Ativo' : 'Inativo',
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeZoppy);
    }
    return serializeZoppy(this.data);
  }
};
