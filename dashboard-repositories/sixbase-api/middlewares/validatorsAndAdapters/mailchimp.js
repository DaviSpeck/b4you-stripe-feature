const ApiError = require('../../error/ApiError');
const MailChimp = require('../../services/integrations/MailChimp');
const { findPlugins } = require('../../database/controllers/plugins');
const { findIntegrationType } = require('../../types/integrationTypes');

const validateMailChimp = async (req, res, next) => {
  const { token, name } = req.body;
  try {
    const fullCredentials = token.split('-', 2);
    const apiKey = fullCredentials[0];
    const subdomain = fullCredentials[1];
    const integration = new MailChimp(apiKey, subdomain);
    await integration.verifyCredentials();
    req.integration = { apiKey, name, subdomain };
    return next();
  } catch (error) {
    return next(
      ApiError.badRequest({
        success: false,
        message: 'Credenciais Mailchimp inválidas',
      }),
    );
  }
};

const findSingleMailChimpIntegration = async (req, res, next) => {
  const { plugin_id: uuid } = req.params;
  const {
    user: { id: id_user },
  } = req;

  try {
    const plugin = await findPlugins({
      uuid,
      id_user,
      id_plugin: findIntegrationType('MailChimp').id,
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
  validateMailChimp,
  findSingleMailChimpIntegration,
};
