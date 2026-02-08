const ApiError = require('../../../error/ApiError');
const SerializeMachine = require('../../../presentation/dashboard/leadlovers/machines');
const SerializeSequence = require('../../../presentation/dashboard/leadlovers/sequences');
const SerializeIntegration = require('../../../presentation/dashboard/integrations');
const SerializeLevels = require('../../../presentation/dashboard/leadlovers/levels');
const SerializePlugins = require('../../../presentation/dashboard/leadlovers/plugins');
const SerializePluginsProducts = require('../../../presentation/dashboard/leadlovers/plugins_products');
const Leadlovers = require('../../../services/integrations/Leadlovers');
const {
  createPlugin,
  deletePlugin,
  findAllPlugins,
} = require('../../../database/controllers/plugins');
const { findIntegrationType } = require('../../../types/integrationTypes');
const {
  createPluginProducts,
  deletePluginProductByUUID,
  deletePluginsProductsByIdPlugin,
  findPluginsProducts,
} = require('../../../database/controllers/plugins_products');
const models = require('../../../database/models/index');

const filterIntegrationProducts = async (pluginsList) => {
  const promisesMachine = [];
  const promisesSequence = [];
  const promisesLevels = [];
  pluginsList.forEach((plugin) => {
    const {
      settings: { machineCode, sequenceCode },
      plugin: {
        settings: { token },
      },
    } = plugin;
    const integration = new Leadlovers(token);
    promisesMachine.push(integration.getMyMachinesById(machineCode));
    promisesSequence.push(
      integration.getSequencesById(machineCode, sequenceCode),
    );
    promisesLevels.push(integration.getLevels(machineCode, sequenceCode));
  });
  const listMachine = await Promise.all(promisesMachine);
  const listSequences = await Promise.all(promisesSequence);
  const listLevels = await Promise.all(promisesLevels);

  pluginsList.forEach((p, index) => {
    p.list_name = listMachine[index].MachineName;
    listSequences.forEach((listSequence) => {
      listSequence.Items.forEach((item) => {
        if (item.SequenceCode === p.settings.sequenceCode) {
          p.list_sequence = item.SequenceName;
        }
      });
    });
    listLevels.forEach((listLevel) => {
      listLevel.Items.forEach((item) => {
        if (item.ModelCode === p.settings.level) {
          p.list_level = item.Subject;
        }
      });
    });
  });
  return pluginsList;
};

const createLeadloversIntegrationController = async (req, res, next) => {
  const { name, token } = req.integration;
  const {
    user: { id: id_user },
  } = req;
  try {
    const settings = {
      name,
      token,
    };
    const plugin = await createPlugin({
      id_user,
      id_plugin: findIntegrationType('LeadLovers').id,
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

const createLeadloversProductIntegrationController = async (req, res, next) => {
  const { settings, id_rule, insert_list } = req.body;
  const {
    product: { id: id_product },
    plugin: { id: id_plugin },
  } = req;
  try {
    const { uuid } = await createPluginProducts({
      id_product,
      id_plugin,
      id_rule,
      insert_list,
      settings,
    });
    return res.send({
      success: true,
      message: 'Regra de integração criada',
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

const getLeadloversIntegrationsController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugins = await findAllPlugins({
      id_user,
      id_plugin: findIntegrationType('LeadLovers').id,
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

const getLeadloversMachinesController = async (req, res, next) => {
  try {
    const {
      plugin: {
        settings: { token },
      },
    } = req;
    const integration = new Leadlovers(token);
    const { Items: machines } = await integration.getMyMachines();
    return res.status(200).send(new SerializeMachine(machines).adapt());
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

const getLeadloversSequenceController = async (req, res, next) => {
  const { machine_uuid: machineCode } = req.params;

  try {
    const {
      plugin: {
        settings: { token },
      },
    } = req;
    const integration = new Leadlovers(token);
    const { Items: machines } = await integration.getSequences(machineCode);
    return res.status(200).send(new SerializeSequence(machines).adapt());
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

const getLeadloversLevelsController = async (req, res, next) => {
  const { machine_uuid: machineCode, sequence_uuid: sequenceCode } = req.params;
  try {
    const {
      plugin: {
        settings: { token },
      },
    } = req;
    const integration = new Leadlovers(token);
    const { Items: levels } = await integration.getLevels(
      machineCode,
      sequenceCode,
    );
    return res.status(200).send(new SerializeLevels(levels).adapt());
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

const getLeadloversProductsController = async (req, res, next) => {
  const {
    plugin: { id: id_plugin },
  } = req;
  try {
    const pluginsList = await findPluginsProducts({ id_plugin });
    const plugins = await filterIntegrationProducts(pluginsList);
    return res.send(new SerializePluginsProducts(plugins).adapt());
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

const getLeadloversByProductController = async (req, res, next) => {
  const {
    product: { id: id_product },
    plugin: { id: id_plugin },
  } = req;

  try {
    const pluginsList = await findPluginsProducts({ id_plugin, id_product });
    const plugins = await filterIntegrationProducts(pluginsList);
    return res.send(new SerializePluginsProducts(plugins).adapt());
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

const deleteOnePluginProductIntegrationController = async (req, res, next) => {
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

const deletePluginProductIntegrationController = async (req, res, next) => {
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
        'Esta integração foi excluída, assim como todas as regras vinculadas a ela.',
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
  createLeadloversIntegrationController,
  createLeadloversProductIntegrationController,
  deleteOnePluginProductIntegrationController,
  deletePluginProductIntegrationController,
  getLeadloversByProductController,
  getLeadloversIntegrationsController,
  getLeadloversLevelsController,
  getLeadloversMachinesController,
  getLeadloversProductsController,
  getLeadloversSequenceController,
};
