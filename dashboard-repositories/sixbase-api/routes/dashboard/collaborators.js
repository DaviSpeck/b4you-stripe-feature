const express = require('express');
const {
  findCollaboratorsController,
  inviteCollaboratorController,
  updateCollaboratorController,
  deleteCollaboratorController,
  findInvitesController,
  acceptOrRejectInviteController,
  getPermissionsController,
  getCurrentCollaborations,
} = require('../../controllers/dashboard/collaborators');
const {
  validateInviteCollaborator,
  validateUpdateCollaboratorPermissions,
  findSelectedCollaborator,
  findPendingInvite,
} = require('../../middlewares/validatorsAndAdapters/collaborators');
const validateDTO = require('../../middlewares/validate-dto');
const validateCreateInviteDTO = require('../../dto/collaborators/createCollaborator');
const updateCollaboratorDTO = require('../../dto/collaborators/updateCollaborator');
const acceptOrRejectDTO = require('../../dto/collaborators/acceptOrReject');
const collaborationPermission = require('../../middlewares/permissions');
const collaboratorsActivity = require('../../middlewares/collaboratorsActivity');

const router = express.Router();

router.get(
  '/',
  collaborationPermission('collaborators'),
  collaboratorsActivity,
  findCollaboratorsController,
);

router.get(
  '/permissions',
  collaborationPermission('collaborators'),
  collaboratorsActivity,
  getPermissionsController,
);

router.post(
  '/invite',
  collaborationPermission('collaborators'),
  collaboratorsActivity,
  validateDTO(validateCreateInviteDTO),
  validateInviteCollaborator,
  inviteCollaboratorController,
);

router.put(
  '/:collaborator_id',
  collaborationPermission('collaborators'),
  collaboratorsActivity,
  validateDTO(updateCollaboratorDTO),
  findSelectedCollaborator,
  validateUpdateCollaboratorPermissions,
  updateCollaboratorController,
);

router.delete(
  '/:collaborator_id',
  collaborationPermission('collaborators'),
  collaboratorsActivity,
  findSelectedCollaborator,
  deleteCollaboratorController,
);

router.get('/invites', findInvitesController);

router.put(
  '/:collaborator_id/change-status/:accept',
  collaborationPermission('collaborators'),
  collaboratorsActivity,
  findPendingInvite,
  validateDTO(acceptOrRejectDTO, 'params'),
  acceptOrRejectInviteController,
);

router.get('/current-collaborations', getCurrentCollaborations);

module.exports = router;
