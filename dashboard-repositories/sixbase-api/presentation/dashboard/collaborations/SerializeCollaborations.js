const { findPermissionType } = require('../../../types/permissionsTypes');
const SerializeUser = require('../../users');

const serializeCollaborations = (collaborations, current_account) =>
  collaborations.map(({ uuid, producer, permissions }) => ({
    ...new SerializeUser(producer).adapt(),
    permissions: Object.keys(permissions).map(
      (p) => findPermissionType(p).label,
    ),
    is_current_account: current_account === uuid,
    original_account: false,
  }));

const serializeUserCollaborations = (currentUser, collaborations) => [
  {
    ...new SerializeUser(currentUser).adapt(),
    original_account: true,
    is_current_account:
      !currentUser.current_account ||
      currentUser.uuid === currentUser.current_account,
  },
  ...serializeCollaborations(collaborations, currentUser.current_account),
];

module.exports = class {
  constructor(currentUser, collaborations) {
    this.currentUser = currentUser;
    this.collaborations = collaborations;
  }

  adapt() {
    return serializeUserCollaborations(this.currentUser, this.collaborations);
  }
};
