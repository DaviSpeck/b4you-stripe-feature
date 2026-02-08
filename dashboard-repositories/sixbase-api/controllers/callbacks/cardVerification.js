const logger = require('../../utils/logger');
const ApiError = require('../../error/ApiError');
const PaymentService = require('../../services/PaymentService');
const DateHelper = require('../../utils/helpers/date');
const {
  findOneVerificationCard,
  updateCardVerification,
} = require('../../database/controllers/card_verification');
const {
  findCardVerificationStatusByKey,
} = require('../../status/cardVerification');

const cardVerificationController = async (req, res, next) => {
  const { refund_id } = req.body;
  logger.info(`CALLBACK REFUNDS -> ${JSON.stringify(req.body)}`);

  try {
    const cardVerification = await findOneVerificationCard({ refund_id });
    if (!cardVerification) throw ApiError.badRequest('Invalid callback');
    const paymentTransaction = await PaymentService.getTransactionByID(
      cardVerification.transaction_id,
    );
    if (!paymentTransaction) throw ApiError.badRequest('Refund not found');
    if (!Array.isArray(paymentTransaction.refunds))
      throw ApiError.badRequest('Refund not found');

    const { refunds } = paymentTransaction;

    const paymentRefund = refunds.find(
      (r) => r.refund_id === cardVerification.refund_id,
    );
    if (!paymentRefund) throw ApiError.badRequest('Refund not found');
    const { status } = paymentRefund;
    if (status === 1) {
      await updateCardVerification(
        { refund_id },
        {
          id_status: findCardVerificationStatusByKey('refunded').id,
          refunded_at: DateHelper().now(),
        },
      );
    } else {
      await updateCardVerification(
        { refund_id },
        {
          id_status: findCardVerificationStatusByKey('refunded-failed').id,
        },
      );
    }
    return res.sendStatus(200);
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
  cardVerificationController,
};
