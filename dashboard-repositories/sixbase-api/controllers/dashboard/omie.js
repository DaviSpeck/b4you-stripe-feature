const ApiError = require('../../error/ApiError');
const OmieService = require('../../services/integrations/Omie');
const SerializeIntegration = require('../../presentation/dashboard/omie/created');
const SerializePlugins = require('../../presentation/dashboard/omie/plugins');
const {
  createPlugin,
  findPlugins,
  findAllPlugins,
  updatePlugin,
  updatePluginSettings,
  deletePlugin,
} = require('../../database/controllers/plugins');

const createOmieIntegrationController = async (req, res, next) => {
  const {
    body: {
      app_key,
      app_secret,
      product_code_omie,
      payment_code_omie,
      category_code_omie,
      account_code_omie,
      scenario_code_omie,
    },
    user: { id: id_user },
  } = req;

  try {
    const existingIntegration = await findPlugins({
      id_user,
      id_plugin: 24,
      active: true,
    });

    if (existingIntegration) {
      throw ApiError.badRequest('User already has an active Omie integration');
    }

    const omieService = new OmieService(app_key, app_secret);

    try {
      await omieService.getProduct(product_code_omie);
    } catch (error) {
      throw ApiError.badRequest('Invalid Omie credentials or product code');
    }

    const integration = await createPlugin({
      id_user,
      id_plugin: 24,
      settings: {
        app_key,
        app_secret,
        product_code_omie,
        payment_code_omie,
        category_code_omie,
        account_code_omie,
        scenario_code_omie,
      },
      active: true,
    });

    return res.status(200).send({
      success: true,
      message: 'Integração criada com sucesso',
      integration: new SerializeIntegration(integration).adapt(),
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

const createTestOmieIntegrationController = async (req, res, next) => {
  const {
    body: {
      app_key,
      app_secret,
      product_code_omie,
      payment_code_omie,
      category_code_omie,
      account_code_omie,
      scenario_code_omie,
    },
    user: { id: id_user },
  } = req;

  try {
    const existingIntegration = await findPlugins({
      id_user,
      id_plugin: 24,
      active: true,
    });

    if (existingIntegration) {
      await updatePlugin(existingIntegration.id, {
        active: false,
      });
    }

    const integration = await createPlugin({
      id_user,
      id_plugin: 24,
      settings: {
        app_key: app_key || 'test_app_key',
        app_secret: app_secret || 'test_app_secret',
        product_code_omie: product_code_omie || 'TEST001',
        payment_code_omie: payment_code_omie || 'BOL',
        category_code_omie: category_code_omie || 'CAT001',
        account_code_omie: account_code_omie || 1,
        scenario_code_omie: scenario_code_omie || 1,
      },
      active: true,
    });

    return res.status(200).send({
      success: true,
      message: 'Integração criada com sucesso',
      integration: new SerializeIntegration(integration).adapt(),
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

const getOmieIntegrationController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;

  try {
    const integrations = await findAllPlugins({
      id_user,
      id_plugin: 24,
    });

    return res.send(new SerializePlugins(integrations).adapt());
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

const updateOmieIntegrationController = async (req, res, next) => {
  const {
    body,
    user: { id: id_user },
  } = req;

  try {
    const existingIntegration = await findPlugins({
      id_user,
      id_plugin: 24,
      active: true,
    });

    if (!existingIntegration) {
      throw ApiError.badRequest('No active Omie integration found');
    }

    const updateSettings = Object.fromEntries(
      Object.entries(body).filter(([, value]) => value !== undefined),
    );

    const newSettings = {
      ...existingIntegration.settings,
      ...updateSettings,
    };

    await updatePluginSettings(existingIntegration.id, newSettings);

    return res.status(200).send({
      success: true,
      message: 'Integração com Omie atualizada com sucesso',
      new_settings: newSettings,
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

const deactivateOmieIntegrationController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;

  try {
    const existingIntegration = await findPlugins({
      id_user,
      id_plugin: 24,
      active: true,
    });

    if (!existingIntegration) {
      throw ApiError.notFound('No active Omie integration found');
    }

    await deletePlugin({ id: existingIntegration.id });

    return res.status(200).send({
      success: true,
      message: 'Integração com Omie removida com sucesso',
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

module.exports = {
  createOmieIntegrationController,
  createTestOmieIntegrationController,
  getOmieIntegrationController,
  updateOmieIntegrationController,
  deactivateOmieIntegrationController,
};
