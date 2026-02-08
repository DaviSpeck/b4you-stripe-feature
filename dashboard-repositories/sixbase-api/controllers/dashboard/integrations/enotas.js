const ApiError = require('../../../error/ApiError');
const SerializeEnotasPlugin = require('../../../presentation/dashboard/enotas/plugin');
const Enotas = require('../../../services/integrations/eNotas');
const {
  createPlugin,
  deletePlugin,
  updatePluginSettings,
  updatePlugin,
  findPlugins,
} = require('../../../database/controllers/plugins');
const { findIntegrationType } = require('../../../types/integrationTypes');
const { findIntegrationTypeByKey } = require('../../../types/integrationTypes');

const ID_PLUGIN_ENOTAS = 3;

const createEnotasIntegrationController = async (req, res, next) => {
  const {
    active,
    api_key,
    cancel_invoice_chargeback,
    issue_invoice,
    send_invoice_customer_mail,
  } = req.integration;
  const {
    user: { id: id_user },
  } = req;
  try {
    const settings = {
      active,
      api_key,
      cancel_invoice_chargeback,
      issue_invoice: Number(issue_invoice),
      send_invoice_customer_mail,
    };
    const plugin = await createPlugin({
      id_user,
      id_plugin: ID_PLUGIN_ENOTAS,
      settings,
    });
    const bling = await findPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('bling').id,
    });
    if (bling) await updatePlugin(bling.id, { active: false });
    return res.status(200).send({
      success: true,
      message: 'Integração criada com sucesso',
      integration: new SerializeEnotasPlugin(plugin).adapt(),
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

const getEnotasIntegrationsController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugins = await findPlugins({
      id_user,
      id_plugin: findIntegrationType('eNotas').id,
    });
    if (!plugins) return res.send([]);
    return res.send(new SerializeEnotasPlugin(plugins).adapt());
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

const deleteEnotasIntegrationController = async (req, res, next) => {
  const {
    plugin: { id: id_plugin },
  } = req;
  try {
    await deletePlugin({ id: id_plugin });
    return res.status(200).send({
      success: true,
      message: 'Integração com eNotas excluída com sucesso',
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

const updateEnotasIntegrationController = async (req, res, next) => {
  const {
    body: {
      active,
      api_key,
      cancel_invoice_chargeback,
      issue_invoice,
      send_invoice_customer_mail,
    },
    plugin: { id },
    user: { id: id_user },
  } = req;
  try {
    const integration = new Enotas(api_key);
    await integration.verifyCredentials();
    const settings = {
      active,
      api_key,
      cancel_invoice_chargeback,
      issue_invoice,
      send_invoice_customer_mail,
    };
    await updatePluginSettings(id, settings);
    const bling = await findPlugins({
      id_user,
      id_plugin: findIntegrationTypeByKey('bling').id,
    });
    if (bling) await updatePlugin(bling.id, { active: false });
    return res.status(200).send({
      success: true,
      message: 'Integração com eNotas atualizada com sucesso',
      new_settings: settings,
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
  createEnotasIntegrationController,
  getEnotasIntegrationsController,
  deleteEnotasIntegrationController,
  updateEnotasIntegrationController,
};
