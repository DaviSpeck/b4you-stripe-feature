const ApiError = require('../../../error/ApiError');
const ActiveCampaign = require('../../../services/integrations/ActiveCampaign');
const SerializeIntegration = require('../../../presentation/dashboard/integrations');
const SerializeIntegrationList = require('../../../presentation/dashboard/integrationLists');
const SerializeActiveCampaign = require('../../../presentation/dashboard/activeCampaign');
const SerializePluginProducts = require('../../../presentation/dashboard/pluginProducts');
const SerializeIntegrationTags = require('../../../presentation/dashboard/integrationTags');

const {
  createPlugin,
  findAllPlugins,
  deletePlugin,
} = require('../../../database/controllers/plugins');
const { findIntegrationType } = require('../../../types/integrationTypes');
const {
  createPluginProducts,
  findPluginsProducts,
  deletePluginsProductsByIdPlugin,
  deletePluginProductByUUID,
} = require('../../../database/controllers/plugins_products');
const models = require('../../../database/models/index');

const filterIntegrationProducts = async (pluginsList, settings) => {
  const { apiKey, apiUrl } = settings;
  const integration = new ActiveCampaign(apiUrl, apiKey);

  const pluginsListFiltered = pluginsList.filter(
    (plugin) => plugin.settings.id_list,
  );

  const promises = pluginsListFiltered.map(async (plugin) => {
    const listPromise = integration.getListById(plugin.settings.id_list);

    const tagsPromise = plugin.settings?.ids_tags
      ? integration.getTagsByIds(plugin.settings.ids_tags)
      : Promise.resolve([]);

    const [listData, tagsData] = await Promise.all([listPromise, tagsPromise]);

    return {
      list_name: listData.list.name,
      tags_name: tagsData.map((tag) => tag.tag.tag),
    };
  });

  const results = await Promise.all(promises);

  pluginsListFiltered.forEach((plugin, index) => {
    plugin.list_name = results[index].list_name;
    plugin.tags_name = results[index].tags_name;
  });

  return pluginsListFiltered;
};

const createActiveCampaignIntegrationController = async (req, res, next) => {
  const { apiKey, apiUrl, name } = req.integration;
  const {
    user: { id: id_user },
  } = req;
  try {
    const settings = {
      apiKey,
      apiUrl,
      name,
    };
    const plugin = await createPlugin({
      id_user,
      id_plugin: findIntegrationType('Active Campaign').id,
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

const getListsActiveCampaignController = async (req, res, next) => {
  const {
    plugin: {
      settings: { apiKey, apiUrl },
    },
  } = req;
  try {
    const integration = new ActiveCampaign(apiUrl, apiKey);

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

const getTagsActiveCampaignController = async (req, res, next) => {
  const {
    plugin: {
      settings: { apiKey, apiUrl },
    },
  } = req;
  try {
    const integration = new ActiveCampaign(apiUrl, apiKey);

    const {
      data: { tags },
    } = await integration.getAllTags();

    return res.status(200).send(new SerializeIntegrationTags(tags).adapt());
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

const getActiveCampaignIntegrationsController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugin = await findAllPlugins({
      id_user,
      id_plugin: findIntegrationType('Active Campaign').id,
    });
    if (!plugin) return res.send([]);
    return res.status(200).send(new SerializeActiveCampaign(plugin).adapt());
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

const createActiveCampaignProductController = async (req, res, next) => {
  const {
    product: { id: id_product },
    plugin: { id: id_plugin },
  } = req;

  const { insert_list = true, id_rule, id_list, ids_tags } = req.body;

  try {
    const { uuid } = await createPluginProducts({
      id_product,
      id_plugin,
      id_rule,
      settings: { id_list, ids_tags },
      insert_list,
    });
    return res.status(200).send({
      success: true,
      message: 'Regra criada com sucesso',
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

const getActiveCampaignProductsController = async (req, res, next) => {
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

const getActiveCampaignByProductController = async (req, res, next) => {
  const {
    product: { id: id_product },
    plugin: { id: id_plugin, settings },
  } = req;
  try {
    const pluginsList = await findPluginsProducts({ id_plugin, id_product });
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

const deleteCredentialActiveCampaignController = async (req, res, next) => {
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
        'The Active Campaign credential has been deleted as well as all product integrations linked to this token.',
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

const deleteProductPluginActiveCampaignController = async (req, res, next) => {
  const {
    pluginProduct: { uuid },
  } = req;
  try {
    await deletePluginProductByUUID(uuid);
    return res
      .status(200)
      .send({ success: true, message: 'Regra de integração deletada' });
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
  createActiveCampaignIntegrationController,
  createActiveCampaignProductController,
  deleteCredentialActiveCampaignController,
  deleteProductPluginActiveCampaignController,
  getActiveCampaignByProductController,
  getActiveCampaignIntegrationsController,
  getActiveCampaignProductsController,
  getListsActiveCampaignController,
  getTagsActiveCampaignController,
};
