const ApiError = require('../../error/ApiError');
const {
  findSubscriptionRenew,
} = require('../../database/controllers/subscriptions');

const SerializeRenewSubscription = require('../../presentation/checkout/renewSubscription');
const Sales_items = require('../../database/models/Sales_items');
const Product_offer = require('../../database/models/Product_offer');

module.exports.getSubscription = async (req, res, next) => {
  const {
    params: { subscription_id },
  } = req;

  try {
    const subscription = await findSubscriptionRenew({ uuid: subscription_id });
    if (!subscription) throw ApiError.badRequest('Assinatura não encontrada');
    const lastSaleItem = await Sales_items.findOne({
      nest: true,
      where: { id_status: 2, id_subscription: subscription.id },
      order: [['id', 'desc']],
      attributes: ['id', 'id_offer'],
    });

    const offer = await Product_offer.findOne({
      raw: true,
      where: { id: lastSaleItem.id_offer },
      attributes: ['id', 'installments', 'student_pays_interest'],
    });

    const { installments, student_pays_interest } = offer;
    subscription.student_pays_interest = student_pays_interest;
    subscription.max_installments = installments;

    return res
      .status(200)
      .send(new SerializeRenewSubscription(subscription).adapt());
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
