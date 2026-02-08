const ApiError = require('../../../error/ApiError');
const SerializePlugins = require('../../../presentation/dashboard/notazz/get');
const { findIntegrationTypeByKey } = require('../../../types/integrationTypes');
const {
  createPlugin,
  findPlugins,
  deletePlugin,
  updatePlugin,
} = require('../../../database/controllers/plugins');
const dateHelper = require('../../../utils/helpers/date');
const Plugins = require('../../../database/models/Plugins');
const Notazz = require('../../../services/integrations/notazz');
const Suppliers = require('../../../database/models/Suppliers');
const Affiliates = require('../../../database/models/Affiliates');

const validateIntegrations = async (id_user) => {
  const bling = await findPlugins({
    id_user,
    id_plugin: findIntegrationTypeByKey('bling').id,
  });
  if (bling)
    throw ApiError.badRequest(
      'É necessário ter apenas uma integração ativa. Verifique os outros apps (Bling e Enotas) ',
    );
  const enotas = await findPlugins({
    id_user,
    id_plugin: findIntegrationTypeByKey('enotas').id,
  });
  if (enotas)
    throw ApiError.badRequest(
      'É necessário ter apenas uma integração ativa. Verifique os outros apps (Bling e Enotas) ',
    );
};

module.exports.createIntegrationController = async (req, res, next) => {
  const {
    user: { id: id_user },
    body: {
      api_key,
      api_key_logistic,
      name,
      send_invoice_customer_mail,
      issue_invoice,
      type,
      service_label,
      start_date,
      id_product,
      id_external_notazz = null,
      generate_invoice = false,
      group_upsell_order,
      webhook_token = null,
    },
  } = req;
  try {
    const existsPlugin = await Plugins.findOne({
      where: {
        id_user,
        id_plugin: findIntegrationTypeByKey('notazz').id,
        id_product: null,
      },
    });
    if (existsPlugin)
      throw ApiError.badRequest(
        'Existe uma integração global ativa, para cadastrar via produto, delete a integração atual.',
      );
    let is_affiliate = false;
    let is_supplier = false;
    const supplier = await Suppliers.findOne({
      where: { id_product, id_user },
    });
    const affiliate = await Affiliates.findOne({
      where: { id_product, id_user },
    });
    if (affiliate && supplier)
      throw ApiError.badRequest(
        'Produto com vinculo de afiliado e fornecedores',
      );
    if (affiliate) {
      is_affiliate = true;
    } else if (supplier) {
      is_supplier = true;
    }
    const instanceNotazz = new Notazz(api_key);
    const isValid = await instanceNotazz.verifyCredentials();
    if (!isValid) throw ApiError.badRequest('Chave de API inválida');
    validateIntegrations(id_user);
    await instanceNotazz.createWebhook();
    const settings = {
      api_key,
      name,
      send_invoice_customer_mail,
      issue_invoice,
      type,
      service_label,
      api_key_logistic,
      generate_invoice,
      webhook_token,
      group_upsell_order,
    };
    const plugin = await createPlugin({
      id_user,
      id_plugin: findIntegrationTypeByKey('notazz').id,
      settings,
      active: true,
      start_date: dateHelper(start_date).format('YYYY-MM-DD'),
      id_product,
      is_affiliate,
      is_supplier,
      id_external_notazz:
        id_external_notazz.length === 0 ? null : id_external_notazz,
    });
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
    const plugins = await Plugins.findAll({
      where: {
        id_user,
        id_plugin: findIntegrationTypeByKey('notazz').id,
      },
      include: [
        { association: 'product', attributes: ['id', 'name'], required: false },
      ],
    });
    if (plugins.length === 0) return res.send([]);
    return res.status(200).send(plugins);
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
    params: { uuid },
  } = req;
  try {
    const plugin = await findPlugins({
      id_plugin: findIntegrationTypeByKey('notazz').id,
      id_user,
      uuid,
    });
    if (!plugin) return res.send([]);
    await deletePlugin({ id: plugin.id });
    return res.status(200).send({
      success: true,
      message: 'Integração com Notazz excluída com sucesso',
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

module.exports.updateNotazzIntegrationController = async (req, res, next) => {
  const {
    body: {
      api_key,
      api_key_logistic,
      send_invoice_customer_mail,
      name,
      issue_invoice,
      type,
      service_label,
      uuid,
      active,
      id_external_notazz,
      generate_invoice,
      group_upsell_order,
      webhook_token = null,
    },
    user: { id: id_user },
  } = req;
  try {
    if (webhook_token) {
      const instanceNotazz = new Notazz(api_key);
      await instanceNotazz.createWebhook();
    }
    const settings = {
      api_key,
      send_invoice_customer_mail,
      name,
      issue_invoice,
      type,
      service_label,
      api_key_logistic,
      generate_invoice,
      webhook_token,
      group_upsell_order,
    };
    const plugin = await findPlugins({
      uuid,
      id_user,
      id_plugin: findIntegrationTypeByKey('notazz').id,
    });
    if (!plugin) throw new Error('Integração não encontrada.');
    await updatePlugin(plugin.id, {
      settings,
      active,
      id_external_notazz:
        id_external_notazz.length === 0 ? null : id_external_notazz,
    });
    return res.status(200).send({
      success: true,
      message: 'Integração com Notazz atualizada com sucesso',
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
