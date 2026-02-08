const ApiError = require('../../error/ApiError');

const { findUserByEmail } = require('../../database/controllers/users');
const {
  findOneCollaborator,
  deleteCollaborator,
} = require('../../database/controllers/collaborators');
const { findPermissionType } = require('../../types/permissionsTypes');
const {
  findCollaborationStatus,
  findCollaborationStatusByKey,
} = require('../../status/collaborationStatus');

const resolvePermissions = (permissions, next) => {
  const allowedPermissions = {};
  permissions.forEach((permission) => {
    const permissionType = findPermissionType(permission);
    if (!permissionType)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Permissão inválida',
        }),
      );
    allowedPermissions[permissionType.key] = true;
    return true;
  });
  return allowedPermissions;
};

const validateInviteCollaborator = async (req, res, next) => {
  const {
    user: { id: id_producer },
  } = req;
  const { email, permissions } = req.body;
  try {
    req.permissions = resolvePermissions(permissions, next);
    const user = await findUserByEmail(email);
    if (user) {
      if (user.id === id_producer)
        return next(
          ApiError.badRequest({
            success: false,
            message:
              'Você não pode ser colaborador e produtor do mesmo produto',
          }),
        );
      const isThereACollaborator = await findOneCollaborator({
        id_user: user.id,
        id_producer,
      });

      if (!isThereACollaborator) {
        req.collaborator = user;
        return next();
      }

      if (
        isThereACollaborator &&
        isThereACollaborator.id_status ===
          findCollaborationStatusByKey('rejected').id
      ) {
        await deleteCollaborator({ id: isThereACollaborator.id });
        req.deleted = true;
      } else
        return next(
          ApiError.badRequest({
            success: false,
            message: 'Colaborador já cadastrado',
          }),
        );
      req.collaborator = user;
    } else {
      req.collaborator = null;
    }
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

const findSelectedCollaborator = async (req, res, next) => {
  const {
    user: { id: id_producer },
    params: { collaborator_id },
  } = req;
  try {
    const collaborator = await findOneCollaborator({
      uuid: collaborator_id,
      id_producer,
    });
    if (!collaborator)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Colaborador não encontrado',
        }),
      );
    req.collaborator = collaborator;
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

const validateUpdateCollaboratorPermissions = async (req, res, next) => {
  const {
    body: { permissions },
  } = req;
  try {
    req.permissions = resolvePermissions(permissions, next);
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

const findPendingInvite = async (req, res, next) => {
  const {
    params: { collaborator_id },
    user: { id: id_user },
  } = req;
  try {
    const collaborator = await findOneCollaborator({
      uuid: collaborator_id,
      id_user,
      id_status: findCollaborationStatus('Pendente').id,
    });
    if (!collaborator)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Colaborador não encontrado',
        }),
      );
    req.collaborator = collaborator;
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
  validateInviteCollaborator,
  validateUpdateCollaboratorPermissions,
  findSelectedCollaborator,
  findPendingInvite,
};
