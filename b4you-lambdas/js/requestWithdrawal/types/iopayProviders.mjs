const providers = [
  {
    id: 1,
    name: 'physical',
    type: 'physical',
  },
  {
    id: 2,
    name: 'education',
    type: 'education',
  },
];

export const findProviderType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  return providers.find((s) => s[parameter] === type);
};

export const findProviderTypeByType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string') throw new Error('type must be string');
  return providers.find((s) => s.type === type);
};
