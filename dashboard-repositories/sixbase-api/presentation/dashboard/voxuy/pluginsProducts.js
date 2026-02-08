const { findRulesTypes } = require('../../../types/integrationRulesTypes');

const resolvePlugins = (plugins) =>
  plugins.map(({ uuid, product, settings, id_rule }) => ({
    uuid,
    product: { uuid: product.uuid, name: product.name },
    settings: { plan_id: settings.plan_id },
    id_rule: findRulesTypes(id_rule),
  }));

const serializePlugins = ({ plugin, plugins }) => {
  const {
    uuid,
    settings: { name, api_key, api_url },
  } = plugin;
  return {
    uuid,
    name,
    api_key,
    api_url,
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
