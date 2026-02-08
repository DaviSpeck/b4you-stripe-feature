const ApiError = require('../../error/ApiError');
const Serializer = require('../../presentation/membership/subscriptions');
const {
  findAllSubscriptionsPaginated,
} = require('../../database/controllers/subscriptions');
const UpdateSubscriptionCreditCardUseCase = require('../../useCases/common/students/UpdateSubscriptionCreditCard');
const CancelSubscriptionUseCase = require('../../useCases/common/students/CancelSubscription');
const {
  findSubscriptionStatusByKey,
} = require('../../status/subscriptionsStatus');

const getStudentSubscriptionsController = async (req, res, next) => {
  const {
    student: { id: id_student },
  } = req;

  const { page = 0, size = 10 } = req.query;

  try {
    const subscriptions = await findAllSubscriptionsPaginated(
      {
        id_student,
        id_status: findSubscriptionStatusByKey('active').id,
      },
      page,
      size,
    );
    return res.status(200).send({
      count: subscriptions.count,
      rows: new Serializer(subscriptions.rows).adapt(),
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

const subscriptionCreditCardController = async (req, res, next) => {
  try {
    await new UpdateSubscriptionCreditCardUseCase(
      req.body,
      req.params,
      req.student,
    ).execute();
    return res.send({
      success: true,
      message: 'Cartão de assinatura atualizado com sucesso',
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

const cancelStudentSubscriptionController = async (req, res, next) => {
  const {
    student: { id: id_student },
    params: { subscription_uuid },
  } = req;
  try {
    await new CancelSubscriptionUseCase({
      subscription_uuid,
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

module.exports = {
  cancelStudentSubscriptionController,
  getStudentSubscriptionsController,
  subscriptionCreditCardController,
};
