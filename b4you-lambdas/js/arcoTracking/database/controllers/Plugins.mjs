import { Plugins } from '../models/Plugins.mjs';

export const findPlugins = async (where) => {
  const plugin = await Plugins.findOne({
    attributes: ['id_user', 'settings'],
    where,
  });
  return plugin;
};
