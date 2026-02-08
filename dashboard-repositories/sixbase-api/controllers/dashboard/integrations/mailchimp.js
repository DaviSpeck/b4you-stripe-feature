const ApiError = require('../../../error/ApiError');
const MailChimp = require('../../../services/integrations/MailChimp');
const {
  createPlugin,
  findAllPlugins,
  deletePlugin,
} = require('../../../database/controllers/plugins');
const {
  createPluginProducts,
  findPluginsProducts,
  deletePluginProductByUUID,
  deletePluginsProductsByIdPlugin,
} = require('../../../database/controllers/plugins_products');
const { findIntegrationType } = require('../../../types/integrationTypes');
const SerializeIntegration = require('../../../presentation/dashboard/mailchimp/plugins');
const SerializePlugins = require('../../../presentation/dashboard/leadlovers/plugins');
const SerializeIntegrationList = require('../../../presentation/dashboard/integrationLists');
const SerializePluginProducts = require('../../../presentation/dashboard/pluginProducts');
const models = require('../../../database/models/index');

const filterIntegrationProducts = async (pluginsList, settings) => {
  const { apiKey, subdomain } = settings;
  const promisesList = [];
  const integration = new MailChimp(apiKey, subdomain);
  pluginsList.forEach((plugin) => {
    promisesList.push(integration.getListById(plugin.settings.id_list));
  });
  const listContacts = await Promise.all(promisesList);
  pluginsList.forEach((p, index) => {
    p.list_name = listContacts[index].name;
  });
  return pluginsList;
};

const createMailChimpIntegrationController = async (req, res, next) => {
  const { apiKey, name, subdomain } = req.integration;
  const {
    user: { id: id_user },
  } = req;
  try {
    const settings = {
      apiKey,
      name,
      subdomain,
    };
    const plugin = await createPlugin({
      id_user,
      id_plugin: findIntegrationType('MailChimp').id,
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

const getMailChimpIntegrationController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugins = await findAllPlugins({
      id_user,
      id_plugin: findIntegrationType('MailChimp').id,
    });
    if (plugins.length === 0) return res.send([]);
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

const getMailChimpListsController = async (req, res, next) => {
  const {
    plugin: {
      settings: { apiKey, subdomain },
    },
  } = req;
  try {
    const integration = new MailChimp(apiKey, subdomain);
    const {
      data: { lists },
    } = await integration.getAllLists();
    return res.status(200).send(new SerializeIntegrationList(lists).adapt());
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

const createMailChimpProductController = async (req, res, next) => {
  const {
    plugin: { id: id_plugin },
    product: { id: id_product },
  } = req;
  const { id_rule, insert_list, id_list } = req.body;
  try {
    const { uuid } = await createPluginProducts({
      id_product,
      id_plugin,
      id_rule,
      settings: { id_list },
      insert_list,
    });
    return res.status(200).send({
      success: true,
      message: 'Integração com MailChimp criada com sucesso',
      uuid,
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

const getMailChimpProductsController = async (req, res, next) => {
  const {
    plugin: { id: id_plugin, settings },
  } = req;
  try {
    const pluginsList = await findPluginsProducts({ id_plugin });
    const plugins = await filterIntegrationProducts(pluginsList, settings);
    return res.send(new SerializePluginProducts(plugins).adapt());
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

const getMailChimpByProductController = async (req, res, next) => {
  const {
    product: { id: id_product },
    plugin: { id: id_plugin, settings },
  } = req;
  try {
    const pluginsList = await findPluginsProducts({ id_plugin, id_product });
    if (pluginsList.length === 0) return res.send([]);
    const plugins = await filterIntegrationProducts(pluginsList, settings);
    return res.send(new SerializePluginProducts(plugins).adapt());
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

const deleteMailChimpProductPluginController = async (req, res, next) => {
  const {
    pluginProduct: { uuid },
  } = req;
  try {
    await deletePluginProductByUUID(uuid);
    return res
      .status(200)
      .send({ success: true, message: 'Plugin product deleted' });
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

const deleteMailChimpIntegrationController = async (req, res, next) => {
  const {
    plugin: { id: id_plugin },
  } = req;
  try {
    await models.sequelize.transaction(async (t) => {
      await Promise.all([
        deletePluginsProductsByIdPlugin({ id_plugin }, t),
        deletePlugin({ id: id_plugin }, t),
      ]);
      return true;
    });
    return res.status(200).send({
      success: true,
      message:
        'The MailChimp credential has been deleted as well as all product integrations linked to this token.',
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

module.exports = {
  createMailChimpIntegrationController,
  createMailChimpProductController,
  getMailChimpByProductController,
  getMailChimpIntegrationController,
  getMailChimpListsController,
  getMailChimpProductsController,
  deleteMailChimpProductPluginController,
  deleteMailChimpIntegrationController,
};
