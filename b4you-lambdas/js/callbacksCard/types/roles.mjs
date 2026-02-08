const rolesTypes = [
  {
    id: 1,
    label: 'Produtor',
    key: 'producer',
  },
  {
    id: 2,
    label: 'Coprodutor',
    key: 'coproducer',
  },
  {
    id: 3,
    label: 'Afiliado',
    key: 'affiliate',
  },
];

export const findRoleType = (role) => {
  if (!role) throw new Error('role must be provided');
  if (typeof role !== 'string' && typeof role !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof role === 'string' ? 'label' : 'id';
  return rolesTypes.find((s) => s[parameter] === role);
};

export const findRoleTypeByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return rolesTypes.find((s) => s.key === key);
};
