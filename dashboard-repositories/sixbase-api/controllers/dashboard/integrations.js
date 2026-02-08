const ApiError = require('../../error/ApiError');
const { integrationRulesTypes } = require('../../types/integrationRulesTypes');
const { integrationTypes } = require('../../types/integrationTypes');

const getAllEventsController = async (req, res, next) => {
  try {
    return res.status(200).send(integrationRulesTypes);
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

const getSellfluxEventsController = async (req, res, next) => {
  try {
    return res
      .status(200)
      .send(
        integrationRulesTypes.filter(
          ({ key }) =>
            key !== 'chargeback' &&
            key !== 'canceled-subscription' &&
            key !== 'late-subscription' &&
            key !== 'renewed-subscription',
        ),
      );
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

const getAstronmembersEventsController = async (req, res, next) => {
  try {
    return res
      .status(200)
      .send(integrationRulesTypes.filter(({ key }) => key !== 'chargeback'));
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

const getAllIntegrationsController = async (req, res, next) => {
  try {
    return res.status(200).send(integrationTypes);
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
  getAllEventsController,
  getAllIntegrationsController,
  getSellfluxEventsController,
  getAstronmembersEventsController,
};
