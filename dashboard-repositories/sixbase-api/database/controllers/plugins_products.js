const Plugins_products = require('../models/Plugins_products');
const Products = require('../models/Products');
const Plugin = require('../models/Plugins');
const rawData = require('../rawData');

const createPluginProducts = async (pluginObj) => {
  const plugin = await Plugins_products.create(pluginObj);
  return plugin;
};

const findPluginsProducts = async (where) => {
  const plugin = await Plugins_products.findAll({
    raw: true,
    nest: true,
    where,
    include: [
      {
        model: Products,
        as: 'product',
      },
      {
        model: Plugin,
        as: 'plugin',
      },
    ],
  });

  return plugin;
};

const findPluginsProductsInvision = async (where) => {
  const plugin = await Plugins_products.findAll({
    raw: true,
    nest: true,
    where,
    include: [
      {
        model: Products,
        as: 'product',
        attributes: ['uuid', 'name'],
      },
    ],
  });
  return plugin;
};

const findRawPlugins = async (where) => {
  const plugins = await Plugins_products.findAll({
    raw: true,
    nest: true,
    where,
  });
  return plugins;
};

const findPluginsProductsEvents = async ({
  id_plugin,
  id_product,
  id_rule,
}) => {
  const plugin = await Plugins_products.findAll({
    nest: true,
    where: { id_product, id_rule },
    include: [
      {
        model: Products,
        as: 'product',
      },
      {
        model: Plugin,
        as: 'plugin',
        where: {
          id_plugin,
        },
      },
    ],
  });

  return rawData(plugin);
};

const findOnePluginProduct = async (where) => {
  const pluginProduct = await Plugins_products.findOne({
    raw: true,
    where,
  });
  return pluginProduct;
};

const deletePluginProductByUUID = async (uuid) => {
  const pluginProduct = await Plugins_products.destroy({
    where: {
      uuid,
    },
  });
  return pluginProduct;
};

const deletePluginsProductsByIdPlugin = async (where, t = null) => {
  const pluginProduct = await Plugins_products.destroy({
    where,
    transaction: t,
  });
  return pluginProduct;
};

module.exports = {
  createPluginProducts,
  deletePluginProductByUUID,
  deletePluginsProductsByIdPlugin,
  findOnePluginProduct,
  findPluginsProducts,
  findPluginsProductsEvents,
  findRawPlugins,
  findPluginsProductsInvision,
};
