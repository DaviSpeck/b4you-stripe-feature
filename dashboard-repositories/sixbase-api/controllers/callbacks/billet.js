const ApiError = require('../../error/ApiError');
const PaymentService = require('../../services/PaymentService');
const PaidBilletUseCase = require('../../useCases/callbacks/paidPayment');
const ExpiredBilletUseCase = require('../../useCases/callbacks/expiredPayment');
const logger = require('../../utils/logger');

const validStatus = [1, 3, 4];
const [PAID, EXPIRED] = validStatus;

const callbackBilletController = async (req, res, next) => {
  const { id, status } = req.body;
  try {
    logger.info(`CALLBACK BILLET -> ${JSON.stringify(req.body)}`);
    let statusBillet = status;
    if (process.env.ENVIRONMENT === 'PRODUCTION') {
      const paymentTransaction = await PaymentService.getTransactionByPSP(id);
      if (!paymentTransaction) throw ApiError.badRequest('Invalid callback');
      statusBillet = paymentTransaction.status;
    }
    if (!validStatus.includes(statusBillet))
      throw ApiError.badRequest('Invalid callback');

    if (statusBillet === PAID) await PaidBilletUseCase.execute({ psp_id: id });

    if (statusBillet === EXPIRED)
      await ExpiredBilletUseCase.execute({ psp_id: id });

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

module.exports = { callbackBilletController };
