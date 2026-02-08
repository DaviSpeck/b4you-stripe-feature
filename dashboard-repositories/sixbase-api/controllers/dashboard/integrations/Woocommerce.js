const {
  createPlugin,
  findAllPlugins,
} = require('../../../database/controllers/plugins');
const ApiError = require('../../../error/ApiError');
const { findIntegrationTypeByKey } = require('../../../types/integrationTypes');
const Plugins = require('../../../database/models/Plugins');

module.exports.create = async (req, res, next) => {
  const {
    user: { id: id_user },
    body,
  } = req;
  try {
    await createPlugin({
      id_user,
      id_plugin: findIntegrationTypeByKey('woocommerce').id,
      settings: {
        url: body.url,
        consumer_key: body.consumer_key,
        consumer_secret: body.consumer_secret,
      },
      active: true,
    });
    return res.sendStatus(200);
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

module.exports.list = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugins = await findAllPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('woocommerce').id,
    });
    return res.status(200).send(
      plugins.map((p) => ({
        active: p.active,
        url: p.settings.url,
        consumer_key: p.settings.consumer_key,
        consumer_secret: p.settings.consumer_secret,
      })),
    );
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

module.exports.delete = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugin = await Plugins.findOne({
      where: {
        id_user,
        id_plugin: findIntegrationTypeByKey('woocommerce').id,
      },
    });
    if (plugin) {
      await plugin.destroy();
    }
    return res.sendStatus(200);
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
