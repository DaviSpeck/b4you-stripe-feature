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
  {
    id: 8,
    name: 'Chargeback em disputa',
    key: 'chargeback_dispute',
    color: 'danger',
  },
];

const findStatus = (status) => {
  if (!status)
    return { id: 0, name: 'Não informado', key: 'unknown', color: 'secondary' };
  if (typeof status !== 'string' && typeof status !== 'number')
    return { id: 0, name: 'Inválido', key: 'invalid', color: 'secondary' };
  const parameter = typeof status === 'string' ? 'name' : 'id';
  const selectedStatus = salesStatus.find((s) => s[parameter] === status);
  const result = selectedStatus || {
    id: 0,
    name: 'Desconhecido',
    key: 'unknown',
    color: 'secondary',
  };

  return result;
};

const findSalesStatusByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string')
    throw new Error('status must be string or number');
  return salesStatus.find((s) => s.key === key);
};

module.exports = {
  salesStatus,
  findStatus,
  findSalesStatusByKey,
};
