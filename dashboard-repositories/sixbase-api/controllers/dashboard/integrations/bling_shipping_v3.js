const { Op } = require('sequelize');
const ApiError = require('../../../error/ApiError');
const SerializePlugins = require('../../../presentation/dashboard/bling-shipping-v3/get');
const SerializeBlingProblems = require('../../../presentation/dashboard/bling-shipping-v3/problems');
const SQS = require('../../../queues/aws');
const { findIntegrationTypeByKey } = require('../../../types/integrationTypes');
const {
  createPlugin,
  findPlugins,
  findAllPlugins,
  deletePlugin,
  updatePlugin,
  updatePluginSettings,
} = require('../../../database/controllers/plugins');
const BlingShippingV3 = require('../../../services/integrations/BlingShippingV3');
const Bling_errors = require('../../../database/models/Bling_errors');
const models = require('../../../database/models/index');
const DateHelper = require('../../../utils/helpers/date');

const ID_USER_ATTRACIONE = 158777;

module.exports.createIntegrationController = async (req, res, next) => {
  const {
    body: {
      generate_invoice = false,
      shipping,
      shipping_service,
      nat_operacao,
    },
    user: { id: id_user },
  } = req;
  try {
    const plugins = await findPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('blingshippingv3').id,
    });

    const integration = new BlingShippingV3();
    const authorizationUrl = integration.getAuthorizeUrl();

    if (plugins) {
      return res
        .send({
          authorizationUrl,
        })
        .status(200);
    }
    const settings = {
      generate_invoice,
      shipping,
      shipping_service,
      nat_operacao,
    };
    await createPlugin({
      id_user,
      id_plugin: findIntegrationTypeByKey('blingshippingv3').id,
      settings,
      active: false,
    });
    return res
      .send({
        authorizationUrl,
      })
      .status(200);
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
      id_plugin: findIntegrationTypeByKey('blingshippingv3').id,
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

module.exports.UpdateNfeConfigController = async (req, res, next) => {
  const {
    user: { id: id_user },
    body: { uuid, issue_invoice },
  } = req;
  try {
    const plugin = await findPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('blingshippingv3').id,
      uuid,
    });
    if (!plugin) return res.status(404).send('Invalido');
    plugin.settings.issue_invoice = Number(issue_invoice);
    await updatePluginSettings(plugin.id, plugin.settings);
    // return res.send(new SerializePlugins(plugins).adapt());
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

module.exports.deleteIntegrationController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugin = await findPlugins({
      id_plugin: findIntegrationTypeByKey('blingshippingv3').id,
      id_user,
    });
    if (!plugin) return res.send([]);
    await models.sequelize.transaction(async (t) => {
      await Promise.all([deletePlugin({ id: plugin.id }, t)]);
      return true;
    });
    return res.status(200).send({
      success: true,
      message: 'Integração com BlingShipping V3 excluída com sucesso',
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

module.exports.createTokenController = async (req, res, next) => {
  const {
    params: { code },
    user: { id: id_user },
  } = req;
  try {
    if (code) {
      const plugin = await findPlugins({
        id_user,
        id_plugin: findIntegrationTypeByKey('blingshippingv3').id,
      });
      if (plugin && plugin.settings) {
        const integration = new BlingShippingV3();
        const refresh_token = await integration.generateToken(code);
        plugin.settings.refresh_token = refresh_token;
        if (refresh_token) {
          await updatePlugin(plugin.id, {
            active: true,
            settings: plugin.settings,
          });
        }
      }
    }
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

module.exports.getProblemsController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const where_sale = {
      id_order_bling: null,
    };
    if (id_user === ID_USER_ATTRACIONE) {
      where_sale.created_at = {
        [Op.lte]: DateHelper().subtract(27, 'h'),
      };
    }
    const problems = await Bling_errors.findAll({
      where: {
        id_user,
        resent: false,
      },
      include: [
        {
          association: 'sale',
          attributes: ['email', 'full_name', 'id'],
          where: where_sale,
          include: [
            {
              association: 'products',
              attributes: ['price', 'id_status', 'paid_at', 'uuid'],
              where: { id_status: 2 },
            },
          ],
        },
      ],
    });
    if (problems.length === 0) return res.send([]);
    return res.send(new SerializeBlingProblems(problems).adapt());
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

module.exports.resendController = async (req, res, next) => {
  const {
    body: { id },
  } = req;
  try {
    const problem = await Bling_errors.findByPk(id);
    if (!problem) res.sendStatus(400);
    problem.resent = true;
    await problem.save();
    await SQS.add('blingShipping', {
      sale_id: problem.id_sale,
      is_upsell: false,
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
