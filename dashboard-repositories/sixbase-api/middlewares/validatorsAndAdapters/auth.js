const Encrypter = require('../../utils/helpers/encrypter');
const ApiError = require('../../error/ApiError');
const LoginFail = require('../../config/loginAttemptsStore');
const { findUserByEmail } = require('../../database/controllers/users');
const { findStudentByEmail } = require('../../database/controllers/students');
const {
  findResetStudentByUUID,
} = require('../../database/controllers/resetStudent');
const { findResetUserByUUID } = require('../../database/controllers/resetUser');
const {
  findOneCollaborator,
} = require('../../database/controllers/collaborators');
const { findCollaborationStatus } = require('../../status/collaborationStatus');
const {
  findStudentSession,
  deleteStudentSession,
} = require('../../database/controllers/student_sessions');

const findEntityByEmail = async (email, find) => find(email);

const findAndValidateEntityByEmail = async (req, find) => {
  const { email, password } = req.body;
  const entity = await findEntityByEmail(email, find);
  if (!entity) return { entity: null, isNotLogged: true };
  const validPassword = await Encrypter.compare(password, entity.password);
  if (!validPassword) return { entity, isNotLogged: true };
  return { entity, isNotLogged: false };
};

const MAX_CONSECUTIVE_FAILS = 3;

const isEntityBlocked = (entity) =>
  entity && entity.consumedPoints > MAX_CONSECUTIVE_FAILS;

const calculateRetrySeconds = (msBeforeNext) =>
  Math.round(msBeforeNext / 1000) || 1;

const findBlockedEntity = async (email) => LoginFail.get(email);

const incrementAttempts = async (email) => LoginFail.consume(email);

const deleteBlockedEntity = async (email) => LoginFail.delete(email);

const isThereTooManyRequests = async (req, res, next) => {
  const { email } = req.body;
  const blockedEntity = await findBlockedEntity(email);
  if (isEntityBlocked(blockedEntity)) {
    const retrySecs = calculateRetrySeconds(blockedEntity.msBeforeNext);
    res.setHeader('Retry-After', String(retrySecs));
    return res.status(429).send({
      success: false,
      message: `try again in ${retrySecs} seconds`,
      seconds: retrySecs,
    });
  }
  return next();
};
const validateAuth = async (req, res, next) => {
  const { email } = req.body;
  try {
    const { entity, isNotLogged } = await findAndValidateEntityByEmail(
      req,
      findUserByEmail,
    );
    if (!entity) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Email/senha inválido',
        }),
      );
    }
    if (isNotLogged) {
      try {
        await incrementAttempts(email);
      } catch (error) {
        if (error instanceof Error) {
          return next(
            ApiError.internalServerError(
              `Internal Server Error, ${Object.keys(
                req.route.methods,
              )[0].toUpperCase()}: ${req.originalUrl}`,
              error,
            ),
          );
        }
        const retrySecs = calculateRetrySeconds(error.msBeforeNext);
        res.set('Retry-After', String(retrySecs));
        return res.status(429).send({
          success: false,
          message: `try again in ${retrySecs} seconds`,
        });
      }
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Email/senha inválido',
        }),
      );
    }
    await deleteBlockedEntity(email);
    req.user = entity;
    return next();
  } catch (error) {
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

const validateAuthStudent = async (req, res, next) => {
  const { email } = req.body;
  try {
    const { entity, isNotLogged } = await findAndValidateEntityByEmail(
      req,
      findStudentByEmail,
      res,
    );
    if (!entity) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Email/senha inválido',
        }),
      );
    }
    if (isNotLogged) {
      try {
        await incrementAttempts(email);
      } catch (error) {
        if (error instanceof Error) {
          return next(
            ApiError.internalServerError(
              `Internal Server Error, ${Object.keys(
                req.route.methods,
              )[0].toUpperCase()}: ${req.originalUrl}`,
              error,
            ),
          );
        }
        const retrySecs = calculateRetrySeconds(error.msBeforeNext);
        res.set('Retry-After', String(retrySecs));
        return res.status(429).send({
          success: false,
          message: `try again in ${retrySecs} seconds`,
        });
      }
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Email/senha inválido',
        }),
      );
    }
    await deleteBlockedEntity(email);
    req.student = entity;
    return next();
  } catch (error) {
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

const findResetToken = async (token, entity) => {
  if (entity === 'user') {
    const resetToken = await findResetUserByUUID(token);
    return resetToken;
  }

  const resetToken = await findResetStudentByUUID(token);
  return resetToken;
};

const identifyEntityByURL = (url) => {
  if (url.includes('dashboard') || url.includes('app')) return 'user';
  return 'student';
};

const validateToken =
  (path = 'body') =>
  async (req, res, next) => {
    const { token } = req[path];
    const entity = identifyEntityByURL(req.originalUrl);
    try {
      const data = await findResetToken(token, entity);
      if (!data) {
        return next(
          ApiError.badRequest({ success: false, message: 'Token inválido' }),
        );
      }
      req.data = data;
      return next();
    } catch (error) {
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

const validateStudentTokenSession =
  (path = 'body') =>
  async (req, res, next) => {
    const { token } = req[path];
    const { producer_id } = req.query;
    try {
      const data = await findStudentSession({ uuid: token });
      if (!data) {
        return next(
          ApiError.badRequest({ success: false, message: 'Token inválido' }),
        );
      }
      await deleteStudentSession({ id: data.id });
      if (data.id_student === 0) {
        if (!producer_id)
          throw ApiError.badRequest('Necessário enviar o dado do produtor');
        req.student = {
          id: 0,
          full_name: 'Sixbase Brasil',
          first_name: 'Sixbase',
          producer_id,
          classroom_id: null,
        };
        return next();
      }
      req.student = data.student;
      return next();
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

const validateRecoveryPassword = async (req, res, next) => {
  const { email } = req.body;
  const entityType = identifyEntityByURL(req.originalUrl);
  try {
    const entity = await findEntityByEmail(
      email,
      entityType === 'user' ? findUserByEmail : findStudentByEmail,
    );
    if (!entity)
      return res.status(200).send({ success: false, message: 'not found' });
    req.entity = entity;
    return next();
  } catch (error) {
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

const isThereACollaborator = async (req, _res, next) => {
  const {
    owner,
    params: { account_id },
  } = req;

  if (owner.uuid === account_id) {
    req.newUser = owner;
    return next();
  }

  try {
    const collaborator = await findOneCollaborator({
      '$producer.uuid$': account_id,
      id_status: findCollaborationStatus('Ativo').id,
      id_user: owner.id,
    });
    if (!collaborator)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Colaborador não encontrado',
        }),
      );
    req.newUser = {
      ...collaborator.producer,
      permissions: collaborator.permissions,
      current_account: collaborator.uuid,
    };

    return next();
  } catch (error) {
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
  validateAuth,
  validateAuthStudent,
  validateToken,
  validateStudentTokenSession,
  validateRecoveryPassword,
  isThereTooManyRequests,
  isThereACollaborator,
};
