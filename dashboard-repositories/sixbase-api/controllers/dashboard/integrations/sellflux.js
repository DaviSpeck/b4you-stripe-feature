const ApiError = require('../../../error/ApiError');
const SerializeIntegration = require('../../../presentation/dashboard/integrations');
const SerializePlugins = require('../../../presentation/dashboard/sellflux/plugins');
const SerializePluginsProducts = require('../../../presentation/dashboard/sellflux/pluginsProducts');
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

module.exports.createSellFluxIntegrationController = async (req, res, next) => {
  const {
    body: { name, api_url_lead },
    user: { id: id_user },
  } = req;

  try {
    const settings = {
      name,
      api_url_lead,
    };
    const plugin = await createPlugin({
      id_user,
      id_plugin: findIntegrationTypeByKey('sellflux').id,
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

module.exports.getSellfluxIntegrationsController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugins = await findAllPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('sellflux').id,
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

module.exports.createSellfluxProductIntegrationsController = async (
  req,
  res,
  next,
) => {
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
      ),
    );
  }
};

module.exports.getSellfluxProductsController = async (req, res, next) => {
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
