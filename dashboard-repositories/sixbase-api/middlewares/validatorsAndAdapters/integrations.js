const ApiError = require('../../error/ApiError');
const ActiveCampaign = require('../../services/integrations/ActiveCampaign');
const Zoppy = require('../../services/integrations/Zoppy');
const HotzApp = require('../../services/integrations/HotzApp');
const { findPlugins } = require('../../database/controllers/plugins');
const {
  findIntegrationType,
  findIntegrationTypeByKey,
} = require('../../types/integrationTypes');

const validateActiveCampaign = async (req, res, next) => {
  const { apiKey, apiUrl, name } = req.body;
  try {
    const integration = new ActiveCampaign(apiUrl, apiKey);
    await integration.verifyCredentials();
    req.integration = { apiKey, apiUrl, name };
    return next();
  } catch (error) {
    return next(
      ApiError.badRequest({
        success: false,
        message: 'Credenciais Active Campaign inválidas',
      }),
    );
  }
};

const findSinglePluginAdapter = async (req, res, next) => {
  const { plugin_id: uuid } = req.params;
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugin = await findPlugins({
      uuid,
      id_user,
      id_plugin: findIntegrationType('Active Campaign').id,
    });
    if (!plugin) return res.send([]);
    req.plugin = plugin;
    return next();
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

const validateHotzappCredential = async (req, res, next) => {
  const { url, product_uuid, allProducts } = req.body;
  try {
    const integration = new HotzApp(url);
    await integration.verifyCredentials();
    req.integration = { url, product_uuid, allProducts };
    return next();
  } catch (error) {
    return next(
      ApiError.badRequest({
        success: false,
        message: 'Credenciais Hotzapp inválidas',
      }),
    );
  }
};

const findSinglePluginHotzapp = async (req, res, next) => {
  const { plugin_uuid: uuid } = req.params;
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugin = await findPlugins({
      uuid,
      id_user,
      id_plugin: findIntegrationType('HotzApp').id,
    });
    if (!plugin) return res.send([]);
    req.plugin = plugin;
    return next();
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

const findSinglePluginZoppy = async (req, res, next) => {
  const { plugin_id: id } = req.params;

  const {
    user: { id: id_user },
  } = req;

  try {
    const plugin = await findPlugins({
      id,
      id_user,
      id_plugin: findIntegrationTypeByKey('zoppy').id,
    });

    if (!plugin) return res.send([]);
    req.plugin = plugin;

    return next();
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

const validateZoppyCredential = async (req, res, next) => {
  const { apiKey } = req.body;

  try {
    const integration = new Zoppy(apiKey);
    await integration.verifyCredentials();

    return next();
  } catch (error) {
    if (
      error?.response?.data?.message === 'External token not found' ||
      error?.response?.data?.statusCode === 401
    ) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Credenciais Zoppy inválidas',
        }),
      );
    }
    if (error?.response?.data?.statusCode === 500) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'API Zoppy indisponível. Tente novamente mais tarde.',
        }),
      );
    }

    return next();
  }
};

module.exports = {
  findSinglePluginAdapter,
  findSinglePluginHotzapp,
  validateActiveCampaign,
  validateHotzappCredential,
  validateZoppyCredential,
  findSinglePluginZoppy,
};
