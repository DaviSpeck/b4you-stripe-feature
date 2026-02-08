const types = [
  {
    id: 1,
    key: 'single',
    label: 'Único',
  },
  {
    id: 2,
    key: 'subscription',
    label: 'Assinatura',
  },
];

const findPaymentType = (role) => {
  if (!role) throw new Error('role must be provided');
  if (typeof role !== 'string' && typeof role !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof role === 'string' ? 'label' : 'id';
  return types.find((s) => s[parameter] === role);
};

const findPaymentTypeByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return types.find((s) => s.key === key);
};

module.exports = {
  types,
  findPaymentType,
  findPaymentTypeByKey,
};
