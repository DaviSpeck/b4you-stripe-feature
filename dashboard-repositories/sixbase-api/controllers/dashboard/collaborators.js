const ApiError = require('../../error/ApiError');
const dateHelper = require('../../utils/helpers/date');
const SerializeCollaborators = require('../../presentation/dashboard/collaborators');
const SerializeInvites = require('../../presentation/dashboard/collaboratorsInvites');
const InviteTeamCollaboratorEmail = require('../../services/email/InviteTeamCollaborator');
const SerializeCollaborations = require('../../presentation/dashboard/collaborations/SerializeCollaborations');
const { permissionTypes } = require('../../types/permissionsTypes');
const { findCollaborationStatus } = require('../../status/collaborationStatus');
const {
  findAllCollaboratorsPaginated,
  createCollaborator,
  updateCollaborator,
  deleteCollaborator,
  findAllCollaborators,
} = require('../../database/controllers/collaborators');
const {
  createResetUserPassword,
} = require('../../database/controllers/resetUser');
const { generateRandomPassword } = require('../../utils/generators');
const CreateUserUseCase = require('../../useCases/dashboard/CreateUser');
const { transformEmailToName } = require('../../utils/formatters');
const { findUserByID } = require('../../database/controllers/users');

const findCollaboratorsController = async (req, res, next) => {
  const {
    query: { page = 0 },
    user: { id: id_producer },
  } = req;
  try {
    const { rows, count } = await findAllCollaboratorsPaginated(
      { id_producer },
      page,
      30,
    );
    return res.status(200).send({
      count,
      rows: new SerializeCollaborators(rows).adapt(),
    });
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

const inviteCollaboratorController = async (req, res, next) => {
  const {
    user: { id: id_producer, full_name },
    body: { email },
    permissions,
    deleted = false,
  } = req;
  let { collaborator } = req;
  let token = null;
  try {
    if (!collaborator && !deleted) {
      collaborator = await new CreateUserUseCase(
        {
          email,
          password: generateRandomPassword(),
          first_name: transformEmailToName(email),
          last_name: '',
          document_number: '',
          whatsapp: '',
        },
        false,
      ).create();
      const { uuid } = await createResetUserPassword({
        id_user: collaborator.id,
      });
      token = uuid;
    }
    const { id, email: collaborator_email, first_name } = collaborator;
    const { uuid: uuidCollaborator } = await createCollaborator({
      id_producer,
      id_user: id,
      id_status: findCollaborationStatus('Pendente').id,
      permissions,
    });
    await new InviteTeamCollaboratorEmail({
      collaborator_email,
      collaborator_name: `${first_name}`,
      producer_name: full_name,
      token,
    }).send();
    return res.status(200).send({
      success: true,
      message: 'invite created successfully',
      email,
      uuid: uuidCollaborator,
    });
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

const updateCollaboratorController = async (req, res, next) => {
  const { collaborator, permissions } = req;
  try {
    await updateCollaborator({ id: collaborator.id }, { permissions });
    return res.sendStatus(200);
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

const deleteCollaboratorController = async (req, res, next) => {
  const { collaborator } = req;
  try {
    await deleteCollaborator({ id: collaborator.id });
    return res.sendStatus(200);
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

const findInvitesController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { page = 0, size = 10 },
  } = req;
  try {
    const invites = await findAllCollaboratorsPaginated(
      { id_user, id_status: findCollaborationStatus('Pendente').id },
      page,
      size,
    );
    return res.status(200).send({
      count: invites.count,
      rows: new SerializeInvites(invites.rows).adapt(),
    });
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

const acceptOrRejectInviteController = async (req, res, next) => {
  const {
    collaborator: { id },
    params: { accept },
  } = req;
  const status = accept ? 'Ativo' : 'Rejeitado';
  const accepted_at = accept ? dateHelper().now() : null;
  try {
    await updateCollaborator(
      { id },
      { id_status: findCollaborationStatus(status).id, accepted_at },
    );
    return res.sendStatus(200);
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

const getPermissionsController = async (req, res) =>
  res.status(200).send(permissionTypes);

const getCurrentCollaborations = async (req, res, next) => {
  const {
    user: { current_account },
    owner: { id: id_user },
  } = req;

  try {
    const currentUser = await findUserByID(id_user);
    const collaborations = await findAllCollaborators({
      id_user,
      id_status: 2,
    });

    return res
      .status(200)
      .send(
        new SerializeCollaborations(
          { ...currentUser, current_account },
          collaborations,
        ).adapt(),
      );
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
  findCollaboratorsController,
  inviteCollaboratorController,
  updateCollaboratorController,
  deleteCollaboratorController,
  findInvitesController,
  acceptOrRejectInviteController,
  getPermissionsController,
  getCurrentCollaborations,
};
