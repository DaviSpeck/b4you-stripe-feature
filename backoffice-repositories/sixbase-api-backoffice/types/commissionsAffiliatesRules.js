const commissionRules = [
  {
    id: 1,
    name: 'first-click',
    label: 'Primeiro Click',
  },
  {
    id: 2,
    name: 'last-click',
    label: 'Último Click',
  },
];

const findClickAttributionType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  const selectedType = commissionRules.find((s) => s[parameter] === type);
  return selectedType;
};

module.exports = {
  commissionRules,
  findClickAttributionType,
};
