const { findRulesTypes } = require('../../../types/integrationRulesTypes');

const resolvePlugins = (plugins) =>
  plugins.map(({ uuid, product, id_rule }) => ({
    uuid,
    product: { uuid: product.uuid, name: product.name },
    id_rule: findRulesTypes(id_rule),
  }));

const serializePlugins = ({ plugin, plugins }) => {
  const {
    uuid,
    settings: { name, webhook_url },
  } = plugin;
  return {
    uuid,
    name,
    webhook_url,
    plugins: resolvePlugins(plugins),
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializePlugins(this.data);
  }
};
