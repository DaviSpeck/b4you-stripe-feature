const ApiError = require('../../../error/ApiError');
const SerializePlugin = require('../../../presentation/dashboard/hotzapp/plugin');
const CreateHotzappCredentialUseCase = require('../../../useCases/dashboard/integrations/CreateHotzappCredential');
const {
  deletePlugin,
  findAllPlugins,
} = require('../../../database/controllers/plugins');
const { findIntegrationType } = require('../../../types/integrationTypes');

const createHotzappCredentialsIntegrationController = async (
  req,
  res,
  next,
) => {
  const { url, product_uuid } = req.integration;
  const {
    user: { id: id_user },
  } = req;
  try {
    return res.status(200).send({
      success: true,
      message: 'Integração criada com sucesso',
      integration: new SerializePlugin(
        await new CreateHotzappCredentialUseCase({
          id_user,
          product_uuid,
          url,
        }).execute(),
      ).adapt(),
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const deleteHotzappCredentialController = async (req, res, next) => {
  const {
    plugin: { id },
  } = req;
  try {
    await deletePlugin({ id });
    return res.status(200).send({
      success: true,
      message: 'Integração deletada com sucesso',
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const findCredentialsController = async (req, res, next) => {
  const {
    user: { id },
  } = req;
  try {
    const plugins = await findAllPlugins({
      id_user: id,
      id_plugin: findIntegrationType('HotzApp').id,
    });
    return res.status(200).send(new SerializePlugin(plugins).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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
  createHotzappCredentialsIntegrationController,
  deleteHotzappCredentialController,
  findCredentialsController,
};
