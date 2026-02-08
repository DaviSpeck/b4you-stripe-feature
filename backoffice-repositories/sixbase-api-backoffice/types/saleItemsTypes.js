const saleItemsTypes = [
  {
    id: 1,
    name: 'Produto Principal',
    type: 'main',
  },
  {
    id: 2,
    name: 'Upsell',
    type: 'upsell',
  },
  {
    id: 3,
    name: 'Order Bump',
    type: 'order-bump',
  },
  {
    id: 4,
    name: 'Assinatura',
    type: 'subscription',
  },
];

const findSaleItemsType = (type) => {
  if (!type) return { id: 0, name: 'Não informado', type: 'unknown' };
  const parameter = typeof type === 'string' ? 'name' : 'id';
  const found = saleItemsTypes.find((s) => s[parameter] === type);
  return found || { id: 0, name: 'Desconhecido', type: 'unknown' };
};

const findSaleItemsTypeByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be a string');
  return saleItemsTypes.find((s) => s.type === key);
};

module.exports = {
  saleItemsTypes,
  findSaleItemsType,
  findSaleItemsTypeByKey,
};
