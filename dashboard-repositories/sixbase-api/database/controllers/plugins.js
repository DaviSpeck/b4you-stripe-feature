const Plugins = require('../models/Plugins');

const createPlugin = async (pluginObj) => {
  const plugin = await Plugins.create(pluginObj);
  return plugin;
};

const findPlugins = async (where) => {
  const plugin = await Plugins.findOne({
    raw: true,
    where,
  });
  return plugin;
};

const findAllPlugins = async (where) => {
  const plugin = await Plugins.findAll({
    raw: true,
    where,
  });
  return plugin;
};

const deletePlugin = async (where, t = null) => {
  const pluginProduct = await Plugins.destroy({
    where,
    transaction: t,
  });
  return pluginProduct;
};

const updatePluginSettings = async (id, settings) => {
  const plugin = await Plugins.update(
    { settings },
    {
      where: { id },
    },
  );

  return plugin;
};

const updatePlugin = async (id, data) => {
  const plugin = await Plugins.update(data, {
    where: { id },
  });
  return plugin;
};

module.exports = {
  createPlugin,
  deletePlugin,
  findAllPlugins,
  findPlugins,
  updatePluginSettings,
  updatePlugin,
};
