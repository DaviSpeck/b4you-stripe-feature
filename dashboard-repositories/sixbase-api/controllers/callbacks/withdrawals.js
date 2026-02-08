const logger = require('../../utils/logger');
const ApiError = require('../../error/ApiError');
const WithdrawalCallbackUseCase = require('../../useCases/callbacks/CallbackWithdrawals');
const TransactionsRepository = require('../../repositories/sequelize/TransactionsRepository');
const BalanceHistoryRepository = require('../../repositories/sequelize/BalanceHistoryRepository');
const BalanceRepository = require('../../repositories/sequelize/BalanceRepository');
const MailService = require('../../services/MailService');
const DatabaseConfig = require('../../repositories/sequelize/Sequelize');
const PaymentService = require('../../services/PaymentService');
const {
  get: getRedis,
  set: setRedis,
  del: delRedis,
} = require('../../config/redis');

const makeMailService = () => {
  const mailServiceInstance = new MailService(
    process.env.MAILJET_PASSWORD,
    process.env.MAILJET_USERNAME,
  );

  return mailServiceInstance;
};

const callbackWithdrawalController = async (req, res, next) => {
  logger.info('CALLBACK FROM PAY42 - PAYOUTS/WITHDRAWALS');
  logger.info(`BODY -> ${JSON.stringify(req.body)}`);
  const { transaction_id } = req.body;
  if (!transaction_id) return res.sendStatus(404);
  try {
    const callbackProcessing = await getRedis(`withdrawal_${transaction_id}`);
    if (callbackProcessing)
      return res
        .status(200)
        .send({ message: 'This transaction already being processed' });
    await setRedis(`withdrawal_${transaction_id}`, transaction_id);
    await new WithdrawalCallbackUseCase({
      BalanceHistoryRepository,
      BalanceRepository,
      DatabaseConfig,
      TransactionsRepository,
      PaymentService,
      EmailService: makeMailService(),
    }).execute(transaction_id);
    await delRedis(`withdrawal_${transaction_id}`);
    return res.sendStatus(200);
  } catch (error) {
    await delRedis(`withdrawal_${transaction_id}`);
    if (error instanceof ApiError) {
      logger.error(
        `error code: ${error.code} - error: ${JSON.stringify(error, null, 4)}`,
      );
      return res.status(error.code).send(error);
    }
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

module.exports = { callbackWithdrawalController };
