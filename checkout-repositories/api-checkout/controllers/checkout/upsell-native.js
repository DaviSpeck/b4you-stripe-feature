const ApiError = require('../../error/ApiError');
const { UpsellNativeOffer } = require('../../useCases/checkout/upsellNative');

const getUpsellNativeDataController = async (req, res, next) => {
  const {
    user_id,
    params: { offer_uuid },
    query: { sale_item_id },
  } = req;

  try {
    if (!sale_item_id) {
      throw ApiError.badRequest('sale_item_id é obrigatório');
    }

    const response = await UpsellNativeOffer.GetData({
      uuid: offer_uuid,
      user_id,
      sale_item_uuid: sale_item_id
    });

    return res.status(200).json(response);
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

const getMultiOffersController = async (req, res, next) => {
  const {
    user_id,
    params: { offer_uuid },
  } = req;

  try {
    const response = await UpsellNativeOffer.GetMultiOffers({
      upsell_uuid: offer_uuid,
      user_id,
    });
    return res.status(200).json(response);
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

const getUpsellNativePaymentDataByOfferController = async (req, res, next) => {
  const {
    user_id,
    body,
  } = req;

  const {
    plan_selected_uuid,
    upsell_offer_uuid,
    offer_selected_uuid,
    sale_item_id,
  } = body;

  try {
    if (plan_selected_uuid) {
      const response = await UpsellNativeOffer.GetPaymentPlan({
        user_id,
        sale_item_uuid: sale_item_id,
        plan_selected_uuid,
        offer_selected_uuid: upsell_offer_uuid,
      });
      return res.status(200).json(response);
    }

    const response = await UpsellNativeOffer.GetPaymentOffer({
      user_id,
      sale_item_uuid: sale_item_id,
      offer_selected_uuid,
    });
    return res.status(200).json(response);
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

const getUpsellNativePaymentDataPixByOfferController = async (
  req,
  res,
  next,
) => {
  const { user_id, body } = req;

  const { plan_selected_uuid, offer_selected_uuid, sale_item_id } = body;

  try {
    const response = await UpsellNativeOffer.GetPaymentPix({
      user_id,
      sale_item_uuid: sale_item_id,
      plan_selected_uuid,
      offer_selected_uuid,
    });
    return res.status(200).json(response);
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
  getMultiOffersController,
  getUpsellNativeDataController,
  getUpsellNativePaymentDataByOfferController,
  getUpsellNativePaymentDataPixByOfferController,
};
