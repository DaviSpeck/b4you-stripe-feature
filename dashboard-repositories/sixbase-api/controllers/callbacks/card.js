const ApiError = require('../../error/ApiError');
const aws = require('../../queues/aws');

const callbackCardController = async (req, res, next) => {
  const { status, id, type } = req.body;
  try {
    if (
      type === 'chargeback_win' ||
      type === 'chargeback' ||
      type === 'chargeback_dispute' ||
      type === 'chargeback_reverse'
    ) {
      await aws.add('callbacksCard', {
        id,
        status,
      });
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

module.exports = { callbackCardController };
