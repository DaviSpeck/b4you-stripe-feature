const salesStatus = [
  {
    id: 1,
    name: 'Aguardando Pagamento',
    key: 'pending',
    color: 'light',
  },
  {
    id: 2,
    name: 'Pago',
    key: 'paid',
    color: 'success',
  },
  {
    id: 3,
    name: 'Negado',
    key: 'denied',
    color: 'warning',
  },
  {
    id: 4,
    name: 'Reembolsado',
    key: 'refunded',
    color: 'warning',
  },
  {
    id: 5,
    name: 'Chargeback',
    key: 'chargeback',
    color: 'danger',
  },
  {
    id: 6,
    name: 'Reembolso solicitado',
    key: 'request-refund',
    color: 'warning',
  },
  {
    id: 7,
    name: 'Expirado',
    key: 'expired',
    color: 'warning',
  },
];

export const findSaleItemStatus = (status) => {
  if (!status) throw new Error('status must be provided');
  if (typeof status !== 'string' && typeof status !== 'number')
    throw new Error('status must be string or number');
  const parameter = typeof status === 'string' ? 'name' : 'id';
  const selectedStatus = salesStatus.find((s) => s[parameter] === status);
  return selectedStatus;
};

export const findSaleItemStatusByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('status must be string or number');
  return salesStatus.find((s) => s.key === key);
};
