const ApiError = require('../../../error/ApiError');
const SerializeIntegration = require('../../../presentation/dashboard/voxuy/credentials');
const SerializePlugins = require('../../../presentation/dashboard/voxuy/getCredentials');
const SerializePluginsProducts = require('../../../presentation/dashboard/voxuy/pluginsProducts');
const SerializePluginList = require('../../../presentation/dashboard/voxuy/plugin');
const { findIntegrationTypeByKey } = require('../../../types/integrationTypes');
const {
  createPlugin,
  findPlugins,
  findAllPlugins,
} = require('../../../database/controllers/plugins');
const {
  createPluginProducts,
  findPluginsProducts,
} = require('../../../database/controllers/plugins_products');

module.exports.createVoxuyIntegrationController = async (req, res, next) => {
  const { name, api_key, api_url } = req.body;
  const {
    user: { id: id_user },
  } = req;
  try {
    const settings = {
      name,
      api_key,
      api_url,
    };
    const plugin = await createPlugin({
      id_user,
      id_plugin: findIntegrationTypeByKey('voxuy').id,
      settings,
    });
    return res.status(200).send({
      success: true,
      message: 'Integração criada com sucesso',
      integration: new SerializeIntegration(plugin).adapt(),
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

module.exports.createVoxuyProductIntegrationController = async (
  req,
  res,
  next,
) => {
  const {
    body: { settings, id_rule },
    params: { plugin_id: uuid },
    user: { id: id_user },
    product: { id: id_product },
  } = req;
  try {
    const plugin = await findPlugins({
      uuid,
      id_user,
    });
    if (!plugin) return res.send([]);
    const pluginProduct = await createPluginProducts({
      id_product,
      id_plugin: plugin.id,
      id_rule,
      insert_list: false,
      settings,
    });
    return res.send({
      success: true,
      message: 'Regra de integração criada',
      uuid: pluginProduct.uuid,
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

module.exports.getVoxuyIntegrationsController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugins = await findAllPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('voxuy').id,
    });
    return res.send(new SerializePlugins(plugins).adapt());
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

module.exports.getVoxuyProductsController = async (req, res, next) => {
  const {
    params: { plugin_id: uuid },
    user: { id: id_user },
  } = req;
  try {
    const plugin = await findPlugins({
      uuid,
      id_user,
    });
    if (!plugin) return res.send([]);
    const plugins = await findPluginsProducts({ id_plugin: plugin.id });
    return res.send(new SerializePluginsProducts({ plugin, plugins }).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.getVoxuyByProductController = async (req, res, next) => {
  const {
    params: { plugin_id: uuid },
    user: { id: id_user },
    product: { id: id_product },
  } = req;
  try {
    const plugin = await findPlugins({
      uuid,
      id_user,
    });
    if (!plugin) return res.send([]);
    const pluginsList = await findPluginsProducts({
      id_plugin: plugin.id,
      id_product,
    });
    return res.status(200).send(new SerializePluginList(pluginsList).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};
