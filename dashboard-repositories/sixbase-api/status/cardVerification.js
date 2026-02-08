const cardVerificationStatus = [
  {
    id: 1,
    label: 'Cobrança falhou',
    key: 'failed',
  },
  {
    id: 2,
    label: 'Transação aprovada',
    key: 'approved',
  },
  {
    id: 3,
    label: 'Reembolso Solicitado',
    key: 'refund-requested',
  },
  {
    id: 4,
    label: 'Reembolsado',
    key: 'refunded',
  },
  {
    id: 5,
    label: 'Falha ao reembolsar',
    key: 'refunded-failed',
  },
];

const findCardVerificationStatusByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return cardVerificationStatus.find((s) => s.key === key);
};

module.exports = {
  cardVerificationStatus,
  findCardVerificationStatusByKey,
};
