const { permissionTypes } = require('../../types/permissionsTypes');
const { capitalizeName } = require('../../utils/formatters');

const serializePermissions = (permissions) =>
  permissionTypes.filter((p) => Object.keys(permissions).includes(p.key));

const serializeSingleCollaborator = (collaborator) => {
  const {
    uuid,
    created_at,
    producer: { full_name },
    permissions,
  } = collaborator;
  return {
    uuid,
    producer_name: capitalizeName(full_name),
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
