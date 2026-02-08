const ApiError = require('../../../error/ApiError');
const SerializePlugins = require('../../../presentation/dashboard/bling/get');
const Bling = require('../../../services/integrations/Bling');
const { findIntegrationTypeByKey } = require('../../../types/integrationTypes');
const {
  createPlugin,
  findAllPlugins,
  findPlugins,
  deletePlugin,
  updatePluginSettings,
  updatePlugin,
} = require('../../../database/controllers/plugins');
const models = require('../../../database/models/index');

module.exports.createIntegrationController = async (req, res, next) => {
  const {
    body: {
      api_key,
      cancel_invoice_chargeback,
      issue_invoice,
      send_invoice_customer_mail,
      nat_operacao,
    },
    user: { id: id_user },
  } = req;
  try {
    const plugins = await findPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('bling').id,
    });
    if (plugins) return res.send([]);
    const settings = {
      api_key,
      issue_invoice: Number(issue_invoice),
      send_invoice_customer_mail,
      cancel_invoice_chargeback,
      nat_operacao,
    };
    const integration = new Bling(api_key);
    const data = await integration.verifyCredentials();

    if (data?.response?.status === 401)
      throw ApiError.badRequest('Credenciais inválidas');
    const plugin = await createPlugin({
      id_user,
      id_plugin: findIntegrationTypeByKey('bling').id,
      settings,
      active: true,
    });
    if (data.status === 200) plugin.verified = true;
    const enotas = await findPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('enotas').id,
    });
    if (enotas) await updatePlugin(enotas.id, { active: false });
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
      id_plugin: findIntegrationTypeByKey('bling').id,
    });
    if (plugins.length === 0) return res.send([]);
    const integration = new Bling(plugins[0].settings.api_key);
    const response = await integration.verifyCredentials();
    plugins[0].verified = true;
    if (!response) plugins[0].verified = false;
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
      id_plugin: findIntegrationTypeByKey('bling').id,
      id_user,
    });
    if (!plugin) return res.send([]);
    await models.sequelize.transaction(async (t) => {
      await Promise.all([deletePlugin({ id: plugin.id }, t)]);
      return true;
    });
    return res.status(200).send({
      success: true,
      message: 'Integração com Bling excluída com sucesso',
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

module.exports.updateIntegrationController = async (req, res, next) => {
  const {
    user: { id: id_user },
    body: {
      api_key,
      cancel_invoice_chargeback,
      issue_invoice,
      send_invoice_customer_mail,
      nat_operacao,
    },
  } = req;
  try {
    const plugin = await findPlugins({
      id_plugin: findIntegrationTypeByKey('bling').id,
      id_user,
    });
    if (!plugin) return res.send([]);
    const settings = {
      api_key,
      issue_invoice: Number(issue_invoice),
      send_invoice_customer_mail,
      cancel_invoice_chargeback,
      nat_operacao,
    };
    const integration = new Bling(api_key);
    await integration.verifyCredentials();
    await updatePluginSettings(plugin.id, settings);
    return res.status(200).send({
      success: true,
      message: 'Integração com Bling atualizada com sucesso',
      new_settings: settings,
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
