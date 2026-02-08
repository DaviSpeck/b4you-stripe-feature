const { findRulesTypes } = require('../../../types/integrationRulesTypes');

const serializeLeadloversPluginProducts = (plugin) => {
  const {
    uuid,
    id_rule,
    product: { name },
    list_name,
    list_sequence,
    list_level,
    settings: { level: levelCode, machineCode, sequenceCode },
    insert_list,
  } = plugin;
  return {
    uuid,
    product_name: name,
    event: findRulesTypes(id_rule).label,
    insert_list,
    machine: {
      code: machineCode,
      label: list_name,
    },
    sequence: {
      code: sequenceCode,
      label: list_sequence,
    },
    level: {
      code: levelCode,
      label: list_level,
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
      return this.data.map(serializeLeadloversPluginProducts);
    }
    return serializeLeadloversPluginProducts(this.data);
  }
};
