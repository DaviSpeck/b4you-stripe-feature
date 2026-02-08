const ApiError = require('../../../error/ApiError');
const {
  createPlugin,
  deletePlugin,
  updatePluginSettings,
  findPlugins,
} = require('../../../database/controllers/plugins');
const { findIntegrationType } = require('../../../types/integrationTypes');
const SerializeIntegration = require('../../../presentation/dashboard/integrations');
const SerializeZoppy = require('../../../presentation/dashboard/zoppy');
const models = require('../../../database/models/index');
const Zoppy = require('../../../services/integrations/Zoppy');

const createZoppyIntegrationController = async (req, res, next) => {
  const { apiKey, status } = req.body;

  const {
    user: { id: id_user },
  } = req;

  try {
    const settings = {
      apiKey,
      status,
    };

    const plugin = await createPlugin({
      id_user,
      id_plugin: findIntegrationType('Zoppy').id,
      settings,
    });

    return res.status(201).json({
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

const getZoppyIntegrationController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;

  try {
    const plugin = await findPlugins({
      id_user,
      id_plugin: findIntegrationType('Zoppy').id,
    });

    if (!plugin) {
      return res.status(200).json({ integration: [] });
    }

    let updatedPlugin = plugin;

    if (plugin.settings?.status !== undefined) {
      try {
        const integration = new Zoppy(plugin.settings.apiKey);
        await integration.verifyCredentials();
      } catch (error) {
        const statusCode = error?.response?.data?.statusCode;
        let updatedStatus = Number(plugin.settings.status);

        if (statusCode === 500 || statusCode === 401) {
          updatedStatus = 0;
        } else if (statusCode === 404 && updatedStatus === 0) {
          updatedStatus = 1;
        } else if (statusCode === 404 && updatedStatus === 1) {
          return res.status(200).json({
            integration: [new SerializeZoppy(plugin).adapt()],
          });
        } else {
          return next(
            ApiError.internalServerError(
              `Internal Server Error, ${req.method.toUpperCase()}: ${
                req.originalUrl
              }`,
            ),
          );
        }

        await updatePluginSettings(plugin.id, {
          apiKey: plugin.settings.apiKey,
          status: updatedStatus,
        });

        updatedPlugin = {
          ...plugin,
          settings: { ...plugin.settings, status: updatedStatus },
        };
      }
    }

    return res.status(200).json({
      integration: new SerializeZoppy([updatedPlugin]).adapt(),
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${req.method.toUpperCase()}: ${
          req.originalUrl
        }`,
      ),
    );
  }
};

const updateZoppyIntegrationController = async (req, res, next) => {
  const { id } = req.plugin;
  const { apiKey, status } = req.body;

  const settings = {
    apiKey,
    status: status === 'Ativo' ? 1 : 0,
  };

  try {
    await updatePluginSettings(id, settings);

    return res.status(200).json({
      success: true,
      message: 'Integração atualizada com sucesso',
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

const deleteZoppyIntegrationController = async (req, res, next) => {
  const {
    plugin: { id },
  } = req;

  try {
    await models.sequelize.transaction(async (t) => {
      await Promise.all([deletePlugin({ id }, t)]);
      return true;
    });

    return res.status(200).json({
      success: true,
      message: 'The Zoppy credential has been deleted.',
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
  createZoppyIntegrationController,
  getZoppyIntegrationController,
  deleteZoppyIntegrationController,
  updateZoppyIntegrationController,
};
