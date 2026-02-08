const ApiError = require('../../error/ApiError');
const PaymentService = require('../../services/PaymentService');
const PaidPixUseCase = require('../../useCases/callbacks/paidPayment');
const ExpiredPixUseCase = require('../../useCases/callbacks/expiredPayment');
const logger = require('../../utils/logger');

const validStatus = [1, 3, 4];
const [PAID, EXPIRED] = validStatus;

const callbackPixController = async (req, res, next) => {
  const { id, status } = req.body;
  try {
    logger.info(`CALLBACK PIX -> ${JSON.stringify(req.body)}`);
    let statusPix = status;
    if (process.env.ENVIRONMENT === 'PRODUCTION') {
      const paymentTransaction = await PaymentService.getTransactionByPSP(id);
      if (!paymentTransaction) throw ApiError.badRequest('Invalid callback');
      statusPix = paymentTransaction.status;
    }
    if (!validStatus.includes(statusPix))
      throw ApiError.badRequest('Invalid callback');

    if (statusPix === PAID) await PaidPixUseCase.execute({ psp_id: id });

    if (statusPix === EXPIRED) await ExpiredPixUseCase.execute({ psp_id: id });

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
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

module.exports = { callbackPixController };
