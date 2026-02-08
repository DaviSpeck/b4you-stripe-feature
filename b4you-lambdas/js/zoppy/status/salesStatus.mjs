const salesStatus = [
  {
    id: 1,
    name: 'processing',
  },
  {
    id: 2,
    name: 'completed',
  },
  {
    id: 3,
    name: 'canceled',
  },
  {
    id: 4,
    name: 'canceled',
  },
  {
    id: 5,
    name: 'canceled',
  },
  {
    id: 6,
    name: 'canceled',
  },
  {
    id: 7,
    name: 'canceled',
  },
];

export const findSalesItemsStatusById = (id) => {
  if (!id) throw new Error('id must be provided');
  if (typeof id !== 'number') throw new Error('status must be number');
  return salesStatus.find((s) => s.id === id);
};

export const findSalesStatusById = (products) => {
  if (products.some(product => product.status === 'completed')) {
    return 'completed';
  }
  
  if (products.some(product => product.status === 'processing')) {
    return 'processing';
  }

  return 'canceled';
};
