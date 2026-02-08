const types = [
  {
    id: 1,
    key: 'fixed',
    label: 'Fixa',
  },
  {
    id: 2,
    key: 'percentage',
    label: 'Percentual',
  },
];

module.exports.findManagerCommissionType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'key' : 'id';
  return types.find((s) => s[parameter] === type);
};
