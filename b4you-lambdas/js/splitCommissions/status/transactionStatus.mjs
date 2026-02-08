export const transactionStatus = [
  {
    id: 1,
    name: 'Pendente',
    color: 'light',
    key: 'pending',
  },
  {
    id: 2,
    name: 'Processado',
    color: 'success',
    key: 'paid',
  },
  {
    id: 3,
    name: 'Processando Requisição',
    key: 'processing',
  },
  {
    id: 4,
    name: 'Negado',
    key: 'denied',
  },
  {
    id: 5,
    name: 'Cancelado',
    key: 'canceled',
  },
  {
    id: 6,
    name: 'Aguardando',
    key: 'waiting',
  },
  {
    id: 7,
    name: 'Expirado',
    key: 'expired',
  },
  {
    id: 8,
    name: 'Reembolsado',
    key: 'refunded',
    color: 'danger',
  },
  {
    id: 9,
    name: 'Chargeback',
    key: 'chargeback',
  },
];

export const findTransactionStatus = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  return transactionStatus.find((s) => s[parameter] === type);
};

export const findTransactionStatusByKey = (key) => {
  if (!key) throw new Error('type must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return transactionStatus.find((s) => s.key === key);
};
