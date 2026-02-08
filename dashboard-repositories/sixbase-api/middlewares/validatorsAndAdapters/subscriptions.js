const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const {
  findOneSubscription,
} = require('../../database/controllers/subscriptions');
const { findSubscriptionStatus } = require('../../status/subscriptionsStatus');

const findSelectedSubscriptionAdapter = async (req, res, next) => {
  const { subscription_id } = req.params;
  const {
    user: { id: id_user },
  } = req;
  try {
    const selectedSubscription = await findOneSubscription({
      uuid: subscription_id,
      id_user,
      active: true,
      id_status: {
        [Op.ne]: [
          findSubscriptionStatus('Cancelado'),
          findSubscriptionStatus('Reembolsado'),
        ],
      },
    });

    if (!selectedSubscription)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Assinatura não encontrada',
        }),
      );
    req.subscription = selectedSubscription;
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
  findSelectedSubscriptionAdapter,
};
