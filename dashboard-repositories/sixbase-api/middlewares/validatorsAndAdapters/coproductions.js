const ApiError = require('../../error/ApiError');
const { validateEmail, validateUUID } = require('../../utils/validations');
const {
  findUserByEmail,
  findUserByUUID,
} = require('../../database/controllers/users');
const { findCoproductionStatus } = require('../../status/coproductionsStatus');
const rawData = require('../../database/rawData');
const CoproductionsInvitesRepository = require('../../repositories/sequelize/CoproductionsInvitesRepository');
const CoproductionsRepository = require('../../repositories/sequelize/CoproductionsRepository');

const validateData = async (req, res, next) => {
  const { data } = req.params;
  if (validateUUID(data)) {
    req.uuid = data;
    return next();
  }
  if (validateEmail(data)) {
    req.email = data;
    return next();
  }
  return next(
    ApiError.badRequest({
      success: false,
      message: 'Invalid data. Must be provided a valid email or uuid',
    }),
  );
};

const validateUser = async (req, res, next) => {
  const { uuid, email } = req;

  let coproductor = null;
  try {
    if (uuid) {
      coproductor = await findUserByUUID(uuid);
    }
    if (email) {
      coproductor = await findUserByEmail(email);
    }
    if (!coproductor)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Coprodutor não encontrado',
        }),
      );
    req.coproductor = coproductor;
    return next();
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

const validateProductInvite = async (req, res, next) => {
  const {
    product: {
      id: id_product,
      producer: { id: id_productor },
    },
    user: { id: id_coproducer },
  } = req;
  try {
    const invite = await CoproductionsInvitesRepository.find({
      id_product,
      id_coproducer,
      id_productor,
      status: findCoproductionStatus('Pendente').id,
    });
    if (!invite)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Convite para produção não encontrado',
        }),
      );
    req.invite = invite;
    return next();
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

const validateProductInviteActive = async (req, res, next) => {
  const {
    product: { id: id_product },
    user: { id: id_user },
  } = req;
  try {
    const invite = await CoproductionsRepository.find({
      id_product,
      id_user,
      status: findCoproductionStatus('Ativo').id,
    });
    if (!invite)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Não foram encontradas coproduções ativas nesse produto',
        }),
      );
    req.invite = rawData(invite);
    return next();
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

module.exports = {
  validateData,
  validateProductInvite,
  validateProductInviteActive,
  validateUser,
};
