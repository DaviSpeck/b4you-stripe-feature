const ApiError = require('../../../error/ApiError');
const SerializePlugins = require('../../../presentation/dashboard/invision/get');
const SerializePluginsList = require('../../../presentation/dashboard/invision/plugins');
const { findIntegrationTypeByKey } = require('../../../types/integrationTypes');
const {
  createPlugin,
  findPlugins,
  deletePlugin,
  findAllPlugins,
} = require('../../../database/controllers/plugins');
const {
  findRawUserProductsInvision,
  findSingleProductWithProducer,
} = require('../../../database/controllers/products');
const models = require('../../../database/models/index');
const {
  deletePluginsProductsByIdPlugin,
  createPluginProducts,
  findPluginsProductsInvision,
  findOnePluginProduct,
  deletePluginProductByUUID,
} = require('../../../database/controllers/plugins_products');
const Invision = require('../../../services/integrations/Invision');

module.exports.createIntegrationController = async (req, res, next) => {
  const {
    user: { id: id_user },
    body: { api_key, api_url },
  } = req;
  try {
    const plugins = await findPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('invision').id,
    });
    if (plugins) return res.send([]);
    const settings = {
      api_key,
      api_url,
    };
    const plugin = await createPlugin({
      id_user,
      id_plugin: findIntegrationTypeByKey('invision').id,
      settings,
      active: true,
    });
    return res.status(200).send({
      success: true,
      message: 'Integração criada com sucesso',
      integration: new SerializePlugins(plugin).adapt(),
    });
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

module.exports.createIntegrationPluginController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { uuid },
    body: {
      id_list_primary,
      name_list_primary,
      id_list_secondary,
      name_list_secondary,
      uuid_product,
    },
  } = req;
  try {
    const plugin = await findPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('invision').id,
      uuid,
    });
    if (!plugin) return res.send([]);
    const product = await findSingleProductWithProducer({ uuid: uuid_product });
    if (!product) return res.send([]);
    await createPluginProducts({
      id_product: product.id,
      id_plugin: plugin.id,
      settings: {
        id_list_primary: Number(id_list_primary),
        name_list_primary,
        id_list_secondary: Number(id_list_secondary),
        name_list_secondary,
      },
    });
    return res.status(200).send({
      success: true,
      message: 'Integração criada com sucesso',
    });
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

module.exports.getInfo = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { uuid },
  } = req;
  try {
    const plugin = await findPlugins({
      uuid,
      id_plugin: findIntegrationTypeByKey('invision').id,
    });
    const products = await findRawUserProductsInvision(id_user);
    const credentials = new Invision(
      plugin.settings.api_url,
      plugin.settings.api_key,
    );
    const groups = await credentials.getGroups();
    return res.status(200).send({
      products,
      groups,
    });
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

module.exports.getIntegrationsController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugins = await findAllPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('invision').id,
    });
    if (plugins.length === 0) return res.send([]);
    return res.send(new SerializePlugins(plugins).adapt());
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

module.exports.getIntegrationsPluginsController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { uuid },
  } = req;
  try {
    const plugin = await findPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('invision').id,
      uuid,
    });

    if (plugin.length === 0) return res.send([]);
    const rules = await findPluginsProductsInvision({ id_plugin: plugin.id });
    return res.send(new SerializePluginsList(rules).adapt());
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

module.exports.deleteIntegrationController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { uuid },
  } = req;
  try {
    const plugin = await findPlugins({
      id_plugin: findIntegrationTypeByKey('invision').id,
      id_user,
      uuid,
    });
    await models.sequelize.transaction(async (t) => {
      await Promise.all([
        deletePluginsProductsByIdPlugin({ id_plugin: plugin.id }, t),
        deletePlugin({ id: plugin.id }, t),
      ]);
      return true;
    });
    if (!plugin) return res.send([]);
    await deletePlugin({ id: plugin.id });
    return res.status(200).send({
      success: true,
      message: 'Integração com Invision excluída com sucesso',
    });
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

module.exports.deleteIntegrationRuleController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { uuid, uuid_plugin },
  } = req;
  try {
    const plugin = await findPlugins({
      id_plugin: findIntegrationTypeByKey('invision').id,
      id_user,
      uuid,
    });
    if (!plugin) return res.send([]);
    const rule = await findOnePluginProduct({
      uuid: uuid_plugin,
      id_plugin: plugin.id,
    });
    deletePluginProductByUUID(rule.uuid);
    return res.status(200).send({
      success: true,
      message: 'Integração com Invision excluída com sucesso',
    });
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
