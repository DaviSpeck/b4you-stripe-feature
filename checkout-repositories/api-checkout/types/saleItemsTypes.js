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
  const parameter = typeof type === 'string' ? 'name' : 'id';
  return saleItemsTypes.find((s) => s[parameter] === type);
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
