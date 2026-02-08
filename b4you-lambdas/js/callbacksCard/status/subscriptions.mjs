const subscriptionStatus = [
  {
    id: 1,
    name: 'Ativo',
    color: 'success',
    key: 'active',
  },
  {
    id: 2,
    name: 'Pendente',
    color: 'light',
    key: 'pending',
  },
  {
    id: 3,
    name: 'Problemas no Pagamento',
    color: 'warning',
    key: 'warning',
  },
  {
    id: 4,
    name: 'Cancelado',
    color: 'danger',
    key: 'canceled',
  },
  {
    id: 5,
    name: 'Reembolsado',
    color: 'warning',
    key: 'refunded',
  },
  {
    id: 6,
    name: 'Chargeback',
    color: 'warning',
    key: 'chargeback',
  },
  {
    id: 7,
    name: 'Chargeback em disputa',
    color: 'warning',
    key: 'chargeback_dispute',
  },
];

export const findSubscriptionStatus = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  return subscriptionStatus.find((s) => s[parameter] === type);
};

export const findSubscriptionStatusByKey = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'key' : 'id';
  const selectedType = subscriptionStatus.find((s) => s[parameter] === type);
  return selectedType;
};
