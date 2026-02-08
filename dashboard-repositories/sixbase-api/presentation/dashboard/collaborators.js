const { findCollaborationStatus } = require('../../status/collaborationStatus');
const { serializePermissions } = require('../common');

const serializeSingleCollaborator = (collaborator) => {
  const {
    uuid,
    id_status,
    created_at,
    collaborator: { email },
    permissions,
  } = collaborator;
  return {
    uuid,
    status: findCollaborationStatus(id_status),
    email,
    created_at,
    permissions: serializePermissions(permissions),
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleCollaborator);
    }
    return serializeSingleCollaborator(this.data);
  }
};
