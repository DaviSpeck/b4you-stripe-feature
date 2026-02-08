const ApiError = require('../../error/ApiError');
const Leadlovers = require('../../services/integrations/Leadlovers');
const { findPlugins } = require('../../database/controllers/plugins');
const {
  findOnePluginProduct,
} = require('../../database/controllers/plugins_products');

const findSingleLeadloversAdapter = async (req, res, next) => {
  const { plugin_id: uuid } = req.params;
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugin = await findPlugins({
      uuid,
      id_user,
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
        error,
      ),
    );
  }
};

const validateLeadlovers = async (req, res, next) => {
  const { token, name } = req.body;
  try {
    const integration = new Leadlovers(token);
    await integration.verifyCredentials();
    req.integration = { name, token };
    return next();
  } catch (error) {
    return next(
      ApiError.badRequest({
        success: false,
        message: 'Credenciais Leadlovers inválidas',
      }),
    );
  }
};

const findSingleProductPluginAdapter = async (req, res, next) => {
  const {
    plugin: { id: id_plugin },
    params: { plugin_product_id: uuid },
  } = req;

  try {
    const pluginProduct = await findOnePluginProduct({ id_plugin, uuid });
    if (!pluginProduct) return res.send([]);
    req.pluginProduct = pluginProduct;
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

module.exports = {
  findSingleProductPluginAdapter,
  findSingleLeadloversAdapter,
  validateLeadlovers,
};
