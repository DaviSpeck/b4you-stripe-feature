const { findRulesTypes } = require('../../types/integrationRulesTypes');

const serializePluginProducts = (plugin_product) => {
  const {
    uuid,
    product: { name },
    id_rule,
    list_name,
    insert_list,
    tags_name,
  } = plugin_product;
  return {
    uuid,
    event: findRulesTypes(id_rule).label,
    product_name: name,
    list_name,
    insert_list,
    tags_name,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializePluginProducts);
    }
    return serializePluginProducts(this.data);
  }
};
