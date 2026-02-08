const ApiError = require('../../../error/ApiError');
const SerializePlugins = require('../../../presentation/dashboard/hsds/get');
const { findIntegrationTypeByKey } = require('../../../types/integrationTypes');
const {
  createPlugin,
  findPlugins,
  deletePlugin,
  findAllPlugins,
} = require('../../../database/controllers/plugins');
const uuid = require('../../../utils/helpers/uuid');

module.exports.createIntegrationController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugins = await findPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('hsds').id,
    });
    if (plugins) return res.send([]);
    const settings = {
      api_key: uuid.v4(),
    };
    const plugin = await createPlugin({
      id_user,
      id_plugin: findIntegrationTypeByKey('hsds').id,
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

module.exports.getIntegrationsController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugins = await findAllPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('hsds').id,
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

module.exports.deleteIntegrationController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugin = await findPlugins({
      id_plugin: findIntegrationTypeByKey('hsds').id,
      id_user,
    });
    if (!plugin) return res.send([]);
    await deletePlugin({ id: plugin.id });
    return res.status(200).send({
      success: true,
      message: 'Integração com HSDS excluída com sucesso',
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
