const callbackTypes = [
  {
    id: 1,
    name: 'withdrawal',
    label: 'Saque',
  },
  {
    id: 2,
    name: 'transaction',
    label: 'Pagamento',
  },
];

const findCallbackType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  const selectedType = callbackTypes.find((s) => s[parameter] === type);
  return selectedType;
};

module.exports = {
  callbackTypes,
  findCallbackType,
};
