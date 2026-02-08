const {
  createPlugin,
  findAllPlugins,
} = require('../../../database/controllers/plugins');
const ApiError = require('../../../error/ApiError');
const { findIntegrationTypeByKey } = require('../../../types/integrationTypes');
const Frenet = require('../../../services/integrations/Frenet');
const Plugins = require('../../../database/models/Plugins');

module.exports.create = async (req, res, next) => {
  const {
    user: { id: id_user },
    body,
  } = req;
  try {
    if (!body.token && !body.cep) {
      throw ApiError.badRequest('Necessário enviar o token');
    }
    const data = {
      RecipientCEP: '88338270',
      SellerCEP: body.cep,
      ShipmentInvoiceValue: 2000,
      RecipientCountry: 'BR',
      ShippingItemArray: [
        {
          Weight: 1,
          Height: 10,
          Length: 10,
          Width: 10,
          Quantity: 1,
        },
      ],
    };
    try {
      await new Frenet(body.token).getShippingQuote(data);
    } catch (error) {
      throw ApiError.badRequest('Token inválido');
    }
    await createPlugin({
      id_user,
      id_plugin: findIntegrationTypeByKey('frenet').id,
      settings: {
        token: body.token,
        cep: body.cep,
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
      id_plugin: findIntegrationTypeByKey('frenet').id,
    });
    return res.status(200).send(
      plugins.map((p) => ({
        active: p.active,
        cep: p.settings.cep,
        token: `${p.settings.token.substring(0, 9)}${'*'.repeat(
          p.settings.token.length - 10,
        )}`,
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
        id_plugin: findIntegrationTypeByKey('frenet').id,
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
