const types = [
  {
    id: 1,
    label: 'Vídeo',
  },
  {
    id: 2,
    label: 'E-book',
  },
  {
    id: 3,
    label: 'Somente pagamento',
  },
  {
    id: 4,
    label: 'Físico',
  },
  {
    id: 5,
    label: 'Único',
  },
];

const findProductFormat = (role) => {
  if (!role) throw new Error('role must be provided');
  if (typeof role !== 'string' && typeof role !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof role === 'string' ? 'label' : 'id';
  return types.find((s) => s[parameter] === role);
};

module.exports = {
  types,
  findProductFormat,
};
