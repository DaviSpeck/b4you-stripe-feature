const ApiError = require('../../error/ApiError');
const { findStudent } = require('../../database/controllers/students');
const SecurityCode = require('../../useCases/common/security/CreateCode');
const StudentRepository = require('../../repositories/sequelize/StudentRepository');
const UserHistoryRepository = require('../../repositories/sequelize/UserHistoryRepository');
const MailService = require('../../services/MailService');
const SerializeSaleItem = require('../../presentation/refunds/getSaleItemInfo');
const SalesItemsRepository = require('../../repositories/sequelize/SalesItemsRepository');
const StudentSalesUseCase = require('../../useCases/refunds/StudentSales');
const CancelSubscriptionUseCase = require('../../useCases/common/students/CancelSubscription');
const UpdateSubscriptionCreditCardUseCase = require('../../useCases/common/students/UpdateSubscriptionCreditCard');

const makeMailService = () => {
  const mailServiceInstance = new MailService(
    process.env.MAILJET_PASSWORD,
    process.env.MAILJET_USERNAME,
  );

  return mailServiceInstance;
};
module.exports.getClientCode = async (req, res, next) => {
  const {
    params: { email },
    ip,
  } = req;
  try {
    const agent = req.headers['user-agent'];
    const client = await findStudent({ email });
    if (!client) throw ApiError.badRequest('E-mail inválido');
    await new SecurityCode({
      UserHistoryRepository,
      StudentRepository,
      EmailService: makeMailService(),
    }).execute({ email: client.email, ip, agent });
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

module.exports.verifyCode = async (req, res, next) => {
  const {
    params: { code },
  } = req;
  try {
    const sales = await new StudentSalesUseCase({
      UserHistoryRepository,
      StudentRepository,
      SalesItemsRepository,
    }).execute(code);
    return res.send(new SerializeSaleItem(sales).adapt());
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

module.exports.cancelSubscription = async (req, res, next) => {
  const {
    params: { id_student, uuid_subscription },
  } = req;
  try {
    await new CancelSubscriptionUseCase({
      subscription_uuid: uuid_subscription,
      id_student,
    }).execute();
    return res.send({
      success: true,
      message: 'Assinatura cancelada com sucesso',
    });
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

module.exports.updateCard = async (req, res, next) => {
  try {
    await new UpdateSubscriptionCreditCardUseCase(
      req.body,
      { subscription_uuid: req.body.subscription_uuid },
      req.body.student,
    ).execute();
    return res.send({
      success: true,
      message: 'Cartão atualizado com sucesso.',
    });
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
