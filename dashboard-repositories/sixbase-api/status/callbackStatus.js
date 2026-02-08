const callbackStatus = [
  {
    id: 1,
    label: 'Pago',
  },
  {
    id: 2,
    label: 'Rejeitado',
  },
  {
    id: 3,
    label: 'Expirado',
  },
  {
    id: 4,
    label: 'Reembolsado',
  },
];

const findCallbackStatus = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'label' : 'id';
  const selectedType = callbackStatus.find((s) => s[parameter] === type);
  return selectedType;
};

module.exports = {
  callbackStatus,
  findCallbackStatus,
};
