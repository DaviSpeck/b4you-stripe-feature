const paymentMethods = [
  {
    id: 1,
    key: 'billet',
    label: 'Boleto',
  },
  {
    id: 2,
    key: 'card',
    label: 'Cartão de Crédito',
  },
  {
    id: 3,
    key: 'pix',
    label: 'Pix',
  },
];

export const findPaymentMethods = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'key' : 'id';
  const selectedType = paymentMethods.find((s) => s[parameter] === type);
  return selectedType;
};

export const findPaymentMethodByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return paymentMethods.find((s) => s.key === key);
};
