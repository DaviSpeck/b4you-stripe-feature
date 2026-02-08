const {
  createPlugin,
  findAllPlugins,
} = require('../../../database/controllers/plugins');
const ApiError = require('../../../error/ApiError');
const { findIntegrationTypeByKey } = require('../../../types/integrationTypes');
const Tiny = require('../../../services/integrations/Tiny');
const Plugins = require('../../../database/models/Plugins');

module.exports.create = async (req, res, next) => {
  
  const {
    user: { id: id_user },
    body,
  } = req;
  try {
    if (!body.token && !body.descricao) {
      throw ApiError.badRequest('Necessário enviar o token');
    }
    try {
     const status = await new Tiny(body.token).getInfo();
     debugger
     if(status.retorno.status == 'Erro')
      throw ApiError.badRequest('Token inválido');
     
    } catch (error) {
      throw ApiError.badRequest('Token inválido');
    }
    await createPlugin({
      id_user,
      id_plugin: findIntegrationTypeByKey('tiny').id,
      settings: {
        token: body.token,
        shipping_service: body.shipping_service,
        methods_shipping: body.methods_shipping,
        descricao: body.descricao,
        operation_nature: body.operation_nature,
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
      id_plugin: findIntegrationTypeByKey('tiny').id,
    });
    return res.status(200).send(
      plugins.map((p) => ({
        active: p.active,
        descricao: p.settings.descricao,
        shipping_service: p.settings.shipping_service,
        methods_shipping: p.settings.methods_shipping,
        token: p.settings.token,
        operation_nature: p.settings.operation_nature,
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
        id_plugin: findIntegrationTypeByKey('tiny').id,
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