const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const { findOnePlan } = require('../../database/controllers/product_plans');
const { findOneOfferPlan } = require('../../database/controllers/offer_plans');
const {
  findAllSubscriptions,
} = require('../../database/controllers/subscriptions');
const { findSubscriptionStatus } = require('../../status/subscriptionsStatus');

const isThereActiveSubscriptions = (subscriptions) => subscriptions.length > 0;

const findSelectedPlanAdapter = async (req, res, next) => {
  const { plan_id } = req.params;
  const {
    product: { id: id_product },
  } = req;
  try {
    const selectedPlan = await findOnePlan({ uuid: plan_id, id_product });
    if (!selectedPlan)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Plano de assinatura não encontrado',
        }),
      );

    const activeSubscriptions = await findAllSubscriptions({
      id_plan: selectedPlan.id,
      id_status: { [Op.ne]: findSubscriptionStatus('Cancelado').id },
    });

    if (isThereActiveSubscriptions(activeSubscriptions))
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Você deve migrar as assinaturas ativas deste plano',
        }),
      );

    req.plan = selectedPlan;
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

const validateLinkPlan = async (req, res, next) => {
  const {
    product: { id: id_product },
    params: { plan_id },
    offer,
  } = req;
  try {
    const selectedPlan = await findOnePlan({ uuid: plan_id, id_product });
    if (!selectedPlan)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Plano de assinatura não encontrado',
        }),
      );
    const isAlreadyLinked = await findOneOfferPlan({
      id_plan: selectedPlan.id,
      id_offer: offer.id,
    });
    if (isAlreadyLinked)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Plano de assinatura já vinculado',
        }),
      );
    req.plan = selectedPlan;
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

const validateUnlinkPlan = async (req, res, next) => {
  const {
    product: { id: id_product },
    params: { plan_id },
    offer,
  } = req;
  try {
    const selectedPlan = await findOnePlan({ uuid: plan_id, id_product });
    if (!selectedPlan)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Plano de assinatura não encontrado',
        }),
      );
    const isLinked = await findOneOfferPlan({
      id_plan: selectedPlan.id,
      id_offer: offer.id,
    });
    if (!isLinked)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Plano de assinatura não vinculado',
        }),
      );
    req.plan = selectedPlan;
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
  findSelectedPlanAdapter,
  validateLinkPlan,
  validateUnlinkPlan,
};
