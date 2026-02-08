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

export const findSaleItemsType = (type) => {
  const parameter = typeof type === 'string' ? 'name' : 'id';
  return saleItemsTypes.find((s) => s[parameter] === type);
};
