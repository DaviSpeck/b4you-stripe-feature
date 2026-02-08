const Cache = require('../config/Cache');
const Plugins = require('../database/models/Plugins');

module.exports.findFrenet = async (product) => {
  const key = `frenet_user_${product.id_user}`;
  const cached = await Cache.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  const plugin = await Plugins.findOne({
    raw: true,
    where: {
      id_user: product.id_user,
      id_plugin: 21,
    },
  });
  if (!plugin) return null;
  await Cache.set(key, JSON.stringify(plugin));
  return plugin;
};
