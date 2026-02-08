const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const CreateCoproductionInviteUseCase = require('../../useCases/dashboard/coproductions/CreateCoproductionInvite');
const CancelCoproductionUseCase = require('../../useCases/dashboard/coproductions/CancelCoproduction');
const CoproductionCancelActiveEmail = require('../../services/email/CoproductionCancelActive');
const CreateNotificationUseCase = require('../../useCases/dashboard/notifications/createNotification');
const SerializaCoproductionInvites = require('../../presentation/dashboard/coproductionsInvites');
const SerializeCoproductions = require('../../presentation/dashboard/coproductions');
const SerializeUser = require('../../presentation/dashboard/user');
const { DATABASE_DATE } = require('../../types/dateTypes');
const DateHelper = require('../../utils/helpers/date');
const { findCoproductionStatus } = require('../../status/coproductionsStatus');
const { findNotificationType } = require('../../types/notificationsTypes');
const UpdateCoproducerCommission = require('../../useCases/dashboard/coproductions/UpdateCoproducerCommission');
const CoproductionsRepository = require('../../repositories/sequelize/CoproductionsRepository');
const CoproductionsInvitesRepository = require('../../repositories/sequelize/CoproductionsInvitesRepository');
const MailService = require('../../services/MailService');
const UserRepository = require('../../repositories/sequelize/UserRepository');

const makeMailService = () => {
  const mailServiceInstance = new MailService(
    process.env.MAILJET_PASSWORD,
    process.env.MAILJET_USERNAME,
  );

  return mailServiceInstance;
};

const getCoproductorController = async (req, res, next) => {
  const { coproductor } = req;
  try {
    return res.status(200).send(new SerializeUser(coproductor).adapt());
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const createCoproducerInviteController = async (req, res, next) => {
  const {
    body: {
      commission,
      expires_at: days_to_expire,
      split_invoice = false,
      email: coproducer_email,
      allow_access = false,
    },
    product: {
      id: id_product,
      id_user: id_producer,
      name: product_name,
      producer: {
        first_name: producer_first_name,
        last_name: producer_last_name,
        email: producer_email,
      },
    },
  } = req;
  try {
    const coproduction = await new CreateCoproductionInviteUseCase(
      {
        id_product,
        id_producer,
        producer_first_name,
        producer_last_name,
        producer_email,
        product_name,
        coproducer_email,
        commission,
        days_to_expire,
        split_invoice,
        allow_access,
      },
      UserRepository,
      CoproductionsRepository,
      CoproductionsInvitesRepository,
      makeMailService(),
    ).execute();
    return res.send(coproduction);
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

const getCoproductionsControllers = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;
  try {
    const today = DateHelper().subtract(15, 'days').format(DATABASE_DATE);
    const coproductions = await CoproductionsRepository.findAll({
      id_product,
      rejected_at: {
        [Op.or]: {
          [Op.gte]: today,
          [Op.eq]: null,
        },
      },
    });
    return res
      .status(200)
      .send(new SerializeCoproductions(coproductions).adapt());
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const rejectInviteController = async (req, res, next) => {
  const {
    invite: { id, id_coproducer: id_user, id_product, id_productor, uuid },
  } = req;
  try {
    await CoproductionsInvitesRepository.update(id, {
      status: findCoproductionStatus('Rejeitado').id,
    });
    await CoproductionsRepository.update(
      { id_user, id_product },
      {
        status: findCoproductionStatus('Rejeitado').id,
        rejected_at: DateHelper().format(DATABASE_DATE),
      },
    );
    await new CreateNotificationUseCase({
      id_user: id_productor,
      type: findNotificationType('Coprodução').id,
      title: 'Coprodução',
      content: 'Seu convite de coprodução foi rejeitado',
      key: 'products-coproductions',
      variant: 'danger',
      params: { invite_uuid: uuid },
    }).execute();
    return res.send({
      success: true,
      message: 'Convite para coprodução rejeitado',
      coproduction_status: 'Rejected',
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const acceptInviteController = async (req, res, next) => {
  const {
    invite: {
      id,
      id_productor,
      coproduction: { id: id_coproduction, uuid },
    },
  } = req;
  try {
    await CoproductionsInvitesRepository.update(id, {
      status: findCoproductionStatus('Ativo').id,
    });
    await CoproductionsRepository.update(
      { id: id_coproduction },
      {
        status: findCoproductionStatus('Ativo').id,
        accepted_at: DateHelper().format(DATABASE_DATE),
      },
    );
    await new CreateNotificationUseCase({
      id_user: id_productor,
      type: findNotificationType('Coprodução').id,
      title: 'Coprodução',
      content: 'Seu convite de coprodução foi aceito',
      key: 'products-coproductions',
      variant: 'success',
      params: { coproduction_uuid: uuid },
    }).execute();
    return res.send({
      success: true,
      message: 'Convite para coprodução aceito',
      coproduction_status: 'Accepted',
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const cancelActiveCoproductionController = async (req, res, next) => {
  const {
    invite: {
      id,
      uuid,
      product: {
        name: product_name,
        producer: { id: id_producer, full_name, email },
      },
      user: { full_name: coproducer_name },
    },
  } = req;
  try {
    await CoproductionsRepository.update(
      { id },
      {
        status: findCoproductionStatus('Rescindido').id,
        canceled_at: DateHelper().format(DATABASE_DATE),
      },
    );
    await new CoproductionCancelActiveEmail({
      email,
      full_name,
      coproducer_name,
      product_name,
    }).send();
    await new CreateNotificationUseCase({
      id_user: id_producer,
      type: findNotificationType('Coprodução').id,
      title: 'Coprodução',
      content: 'Seu contrato de coprodução foi cancelado pelo coprodutor',
      key: 'products-coproductions',
      variant: 'error',
      params: { coproduction_uuid: uuid },
    }).execute();
    return res.send({
      success: true,
      message: 'Coprodução ativa cancelada pelo coprodutor',
      email: 'Sent to producer',
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const getCoproductionsInvitesController = async (req, res, next) => {
  const {
    user: { id: id_coproducer },
  } = req;
  try {
    const invites = await CoproductionsInvitesRepository.findAll({
      id_coproducer,
      status: findCoproductionStatus('Pendente').id,
    });
    return res
      .status(200)
      .send(new SerializaCoproductionInvites(invites).adapt());
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const cancelCoproductionController = async (req, res, next) => {
  const {
    product: { id: id_product },
    user: { full_name: producer_name },
    params: { coproduction_uuid },
  } = req;
  try {
    await new CancelCoproductionUseCase(
      {
        id_product,
        coproduction_uuid,
        producer_name,
      },
      CoproductionsRepository,
      CoproductionsInvitesRepository,
      makeMailService(),
    ).execute();
    return res.send({
      success: true,
      message: 'Coprodução cancelada',
      email: 'Enviado ao coprodutor',
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

const allowAccessCoproductionController = async (req, res, next) => {
  const {
    product: { id: id_product },
    params: { id_coproductor },
    body: { allow_access },
  } = req;
  try {
    const coproduction = await CoproductionsRepository.find({
      id_product,
      '$user.uuid$': id_coproductor,
    });
    if (!coproduction)
      throw ApiError.badRequest('Não existe coprodutor para este produto');
    await CoproductionsRepository.update(
      { id: coproduction.id },
      { allow_access },
    );
    return res.send({
      success: true,
      message: 'Coprodução atualizada com sucesso',
    });
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

const updateCoproductionController = async (req, res, next) => {
  const {
    body: { commission },
    product: { id: id_product },
    params: { coproducer_uuid },
  } = req;
  try {
    await new UpdateCoproducerCommission(
      {
        commission,
        coproducer_uuid,
        id_product,
      },
      CoproductionsRepository,
      CoproductionsInvitesRepository,
      makeMailService(),
    ).execute();
    return res.send({
      success: true,
      message: 'Coprodução atualizada com sucesso',
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
  allowAccessCoproductionController,
  acceptInviteController,
  cancelActiveCoproductionController,
  cancelCoproductionController,
  createCoproducerInviteController,
  getCoproductionsControllers,
  getCoproductionsInvitesController,
  getCoproductorController,
  rejectInviteController,
  updateCoproductionController,
};
