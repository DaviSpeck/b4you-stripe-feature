const ApiError = require('../../error/ApiError');
const SerializePlan = require('../../presentation/dashboard/plans');
const {
  createProductPlan,
  findAllPlans,
} = require('../../database/controllers/product_plans');
const {
  translateToDatabase,
  frontEndFrequencies,
} = require('../../types/frequencyTypes');
const {
  createOfferPlan,
  deleteOfferPlan,
} = require('../../database/controllers/offer_plans');
const DeletePlanUseCase = require('../../useCases/dashboard/plans/deletePlan');
const FindPlansThatOfferDoesntHaveUseCase = require('../../useCases/dashboard/plans/findPlansThatOfferDoesntHave');
const {
  findOfferWithPlans,
} = require('../../database/controllers/product_offer');

const createPlanController = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;
  const {
    price,
    label,
    payment_frequency,
    subscription_fee,
    subscription_fee_price,
    charge_first,
  } = req.body;
  const translatedPaymentFrequency = translateToDatabase(payment_frequency);
  try {
    const plan = await createProductPlan({
      price,
      label,
      payment_frequency: translatedPaymentFrequency.payment_frequency,
      frequency_quantity: translatedPaymentFrequency.frequency_quantity,
      frequency_label: translatedPaymentFrequency.frequency_label,
      id_product,
      subscription_fee,
      subscription_fee_price,
      charge_first,
    });
    return res.status(200).send(new SerializePlan(plan).adapt());
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

const findProductPlansController = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;
  try {
    const productPlans = await findAllPlans({ id_product });
    return res.status(200).send(new SerializePlan(productPlans).adapt());
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

const deletePlanController = async (req, res, next) => {
  const {
    params: { plan_id },
    product: { id: id_product },
  } = req;
  try {
    await new DeletePlanUseCase(plan_id, id_product).execute();
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

const findFrequenciesController = async (req, res) =>
  res.status(200).send(frontEndFrequencies);

const linkPlanController = async (req, res, next) => {
  const { offer, plan } = req;
  try {
    await createOfferPlan({
      id_offer: offer.id,
      id_plan: plan.id,
    });
    const { plans } = await findOfferWithPlans({ id: offer.id });
    return res.status(200).send(new SerializePlan(plans).adapt());
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

const unlinkPlanController = async (req, res, next) => {
  const { offer, plan } = req;
  try {
    await deleteOfferPlan({ id_plan: plan.id, id_offer: offer.id });
    const { plans } = await findOfferWithPlans({ id: offer.id });
    return res.status(200).send(new SerializePlan(plans).adapt());
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

const findPlansThatOfferDoesntHaveController = async (req, res, next) => {
  const {
    product: { id: id_product },
    params: { offer_id },
  } = req;
  try {
    const plans = await new FindPlansThatOfferDoesntHaveUseCase(
      offer_id,
      id_product,
    ).execute();
    return res.status(200).send(new SerializePlan(plans).adapt());
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
  createPlanController,
  findProductPlansController,
  deletePlanController,
  findFrequenciesController,
  linkPlanController,
  unlinkPlanController,
  findPlansThatOfferDoesntHaveController,
};
