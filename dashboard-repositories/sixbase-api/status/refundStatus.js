const refundStatus = [
  {
    id: 1,
    name: 'Solicitado pelo comprador',
    color: 'light',
    key: 'requested-by-student',
  },
  {
    id: 2,
    name: 'Solicitado pelo produtor',
    color: 'success',
    key: 'requested-by-producer',
  },
  {
    id: 3,
    name: 'Aceito',
    color: 'warning',
    key: 'paid',
  },
  {
    id: 4,
    name: 'Negado',
    color: 'warning',
    key: 'denied',
  },
  {
    id: 5,
    name: 'Aguardando conta bancária do estudante',
    key: 'missing-bank-account',
  },
  {
    id: 6,
    name: 'Solicitado reembolso em garantia',
    key: 'refund-warranty',
  },
  {
    id: 7,
    name: 'Comprador desistiu do reembolso em garantia',
    key: 'refund-warranty-canceled',
  },
];

const findRefundStatus = (status) => {
  if (!status) throw new Error('status must be provided');
  if (typeof status !== 'string' && typeof status !== 'number')
    throw new Error('status must be string or number');
  const parameter = typeof status === 'string' ? 'name' : 'id';
  return refundStatus.find((s) => s[parameter] === status);
};

const findRefundStatusByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be a string');
  return refundStatus.find((r) => r.key === key);
};

module.exports = {
  refundStatus,
  findRefundStatus,
  findRefundStatusByKey,
};
