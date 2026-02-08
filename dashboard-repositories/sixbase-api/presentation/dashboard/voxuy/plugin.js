const { findRulesTypes } = require('../../../types/integrationRulesTypes');

const serializePlugins = (plugins) => {
  const {
    uuid,
    settings: { plan_id },
    product: { uuid: uuid_product, name },
    id_rule,
  } = plugins;
  return {
    uuid,
    plan_id,
    event: findRulesTypes(id_rule).label,
    product: {
      uuid: uuid_product,
      name,
    },
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializePlugins);
    }
    return serializePlugins(this.data);
  }
};
