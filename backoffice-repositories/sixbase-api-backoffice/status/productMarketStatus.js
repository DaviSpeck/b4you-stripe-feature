const productMarketStatus = [
  {
    id: 1,
    label: 'Desativado',
    color: 'light',
    key: 'hide',
  },
  {
    id: 2,
    label: 'Pendente',
    color: 'light',
    key: 'pending',
  },
  {
    id: 3,
    label: 'Ativo',
    color: 'success',
    key: 'active',
  },
  {
    id: 4,
    label: 'Recusado',
    color: 'danger',
    key: 'refused',
  },
];

const findProductMarketStatus = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'label' : 'id';
  return productMarketStatus.find((s) => s[parameter] === type);
};

const findProductMarketStatusByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return productMarketStatus.find((s) => s.key === key);
};

module.exports = {
  productMarketStatus,
  findProductMarketStatus,
  findProductMarketStatusByKey,
};
