const collaborationStatus = [
  {
    id: 1,
    name: 'Pendente',
    color: 'light',
    key: 'pending',
  },
  {
    id: 2,
    name: 'Ativo',
    color: 'success',
    key: 'active',
  },
  {
    id: 3,
    name: 'Rejeitado',
    color: 'danger',
    key: 'rejected',
  },
];

const findCollaborationStatus = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  const selectedType = collaborationStatus.find((s) => s[parameter] === type);
  return selectedType;
};

const findCollaborationStatusByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return collaborationStatus.find((s) => s.key === key);
};

module.exports = {
  collaborationStatus,
  findCollaborationStatus,
  findCollaborationStatusByKey,
};
