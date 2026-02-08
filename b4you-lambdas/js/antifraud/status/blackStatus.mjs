const salesBlacklistStatus = [
  {
    id: 1,
    name: 'Pendente',
    key: 'pending',
    color: 'light',
  },
  {
    id: 2,
    name: 'Aceito',
    key: 'accepted',
    color: 'success',
  },
  {
    id: 3,
    name: 'Negado',
    key: 'denied',
    color: 'warning',
  },
];

export const findSaleBlackStatus = (status) => {
  if (!status) throw new Error('status must be provided');
  if (typeof status !== 'string' && typeof status !== 'number')
    throw new Error('status must be string or number');
  const parameter = typeof status === 'string' ? 'name' : 'id';
  const selectedStatus = salesBlacklistStatus.find((s) => s[parameter] === status);
  return selectedStatus;
};

export const findSaleBlackStatusByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('status must be string or number');
  return salesBlacklistStatus.find((s) => s.key === key);
};
