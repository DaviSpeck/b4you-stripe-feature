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
      id_plugin: findIntegrationTypeByKey('shopify').id,
      settings: {
        link: body.link,
        name: body.name,
        shopName: body.shopName,
        accessToken: body.accessToken,
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
      id_plugin: findIntegrationTypeByKey('shopify').id,
    });
    return res.status(200).send(
      plugins.map((p) => ({
        active: p.active,
        link: p.settings.link,
        name: p.settings.name,
        shopName: p.settings.shopName,
        accessToken: p.settings.accessToken,
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
        id_plugin: findIntegrationTypeByKey('shopify').id,
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
