const productMarketVerifyStatus = [
  {
    id: 1,
    label: 'Pendente',
    color: 'light',
    key: 'pending',
  },
  {
    id: 2,
    label: 'Aceito',
    color: 'success',
    key: 'accepted',
  },
  {
    id: 3,
    label: 'Recusado',
    color: 'error',
    key: 'refused',
  },
];

const findProductMarketVerifyStatus = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'label' : 'id';
  return productMarketVerifyStatus.find((s) => s[parameter] === type);
};

const findProductMarketVerifyStatusByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return productMarketVerifyStatus.find((s) => s.key === key);
};

module.exports = {
  productMarketVerifyStatus,
  findProductMarketVerifyStatus,
  findProductMarketVerifyStatusByKey,
};
