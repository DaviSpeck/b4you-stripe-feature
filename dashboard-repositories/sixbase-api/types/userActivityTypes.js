const userActivityTypes = [
  {
    id: 1,
    label: 'Multa',
    key: 'penalty',
  },
  {
    id: 2,
    label: 'Depósito',
    key: 'deposit',
  },
];

const findUserActivityType = (type) => {
  const parameter = typeof type === 'string' ? 'name' : 'id';
  return userActivityTypes.find((s) => s[parameter] === type);
};

const findUserActivityTypeByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be a string');
  return userActivityTypes.find((s) => s.key === key);
};

module.exports = {
  userActivityTypes,
  findUserActivityType,
  findUserActivityTypeByKey,
};
