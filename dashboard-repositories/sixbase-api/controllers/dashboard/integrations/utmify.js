const ApiError = require('../../../error/ApiError');
const SerializeIntegration = require('../../../presentation/dashboard/utmify/created');
const SerializePlugins = require('../../../presentation/dashboard/utmify/plugins');
const SerializePluginsProducts = require('../../../presentation/dashboard/utmify/pluginsProducts');
const { findIntegrationTypeByKey } = require('../../../types/integrationTypes');
const {
  createPlugin,
  findAllPlugins,
  findPlugins,
} = require('../../../database/controllers/plugins');
const {
  createPluginProducts,
  findPluginsProducts,
} = require('../../../database/controllers/plugins_products');

module.exports.createIntegrationController = async (req, res, next) => {
  const {
    body: { name, api_token },
    user: { id: id_user },
  } = req;

  try {
    const settings = {
      name,
      api_token,
    };
    const plugin = await createPlugin({
      id_user,
      id_plugin: findIntegrationTypeByKey('utmify').id,
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
        error,
      ),
    );
  }
};

module.exports.getIntegrationsController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugins = await findAllPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('utmify').id,
    });
    return res.send(new SerializePlugins(plugins).adapt());
  } catch (error) {
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

module.exports.createProductIntegrationController = async (req, res, next) => {
  const {
    body: { id_rule },
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
      settings: null,
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
        error,
      ),
    );
  }
};

module.exports.getProductsController = async (req, res, next) => {
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
