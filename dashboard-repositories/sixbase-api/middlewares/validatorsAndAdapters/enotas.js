const ApiError = require('../../error/ApiError');
const Enotas = require('../../services/integrations/eNotas');
const { findPlugins } = require('../../database/controllers/plugins');
const { findIntegrationType } = require('../../types/integrationTypes');

const validateEnotas = async (req, res, next) => {
  const {
    user: { id: id_user },
    body: {
      api_key,
      cancel_invoice_chargeback,
      issue_invoice,
      send_invoice_customer_mail,
    },
  } = req;
  try {
    const plugins = await findPlugins({
      id_user,
      id_plugin: findIntegrationType('eNotas').id,
    });
    if (plugins) return res.send([]);
    const integration = new Enotas(api_key);
    await integration.verifyCredentials();
    req.integration = {
      active: true,
      api_key,
      cancel_invoice_chargeback,
      issue_invoice,
      send_invoice_customer_mail,
    };
    return next();
  } catch (error) {
    return next(
      ApiError.badRequest({
        success: false,
        message: 'Credenciais eNotas inválidas',
      }),
    );
  }
};

const findSingleEnotasAdapter = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const plugin = await findPlugins({
      id_plugin: findIntegrationType('eNotas').id,
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

module.exports = {
  validateEnotas,
  findSingleEnotasAdapter,
};
