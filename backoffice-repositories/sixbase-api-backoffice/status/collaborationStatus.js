const collaborationStatus = [
  {
    id: 1,
    name: 'Pendente',
    color: 'light',
  },
  {
    id: 2,
    name: 'Ativo',
    color: 'success',
  },
  {
    id: 3,
    name: 'Rejeitado',
    color: 'danger',
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

module.exports = {
  collaborationStatus,
  findCollaborationStatus,
};
