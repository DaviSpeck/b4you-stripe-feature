const ApiError = require('../../error/ApiError');
const logger = require('../../utils/logger');

const aws = require('../../queues/aws');

const callbackChargebackController = async (req, res, next) => {
  const { id, status, event_id, occurred_at } = req.body;

  logger.info(`CALLBACK CHARGEBACK -> ${JSON.stringify(req.body)}`);
  try {
    await aws.add('callbacksCard', {
      id,
      status,
      event_id,
      occurred_at,
    });
    logger.info(`aws queue callbacksCard dispatch`);
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

module.exports = {
  callbackChargebackController,
};
