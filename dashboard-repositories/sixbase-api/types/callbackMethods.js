const callbackMethods = [
  {
    id: 1,
    name: 'payout_pix',
    label: 'Saque Pix',
  },
  {
    id: 2,
    name: 'boleto',
    label: 'Boleto',
  },
  {
    id: 3,
    name: 'pix',
    label: 'Pix',
  },
];

const findCallbackMethod = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  const selectedType = callbackMethods.find((s) => s[parameter] === type);
  return selectedType;
};

module.exports = {
  callbackMethods,
  findCallbackMethod,
};
