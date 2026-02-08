const status = [
  {
    id: 1,
    label: 'Criada',
    key: 'created',
  },
  {
    id: 2,
    label: 'Aguardando pagamento',
    key: 'waiting',
    color: 'secondary',
  },
  {
    id: 3,
    label: 'Paga',
    key: 'released',
    color: 'success',
  },
  {
    id: 4,
    label: 'Reembolsada',
    key: 'refunded',
    color: 'warning',
  },
  {
    id: 5,
    label: 'Chargeback',
    key: 'chargeback',
    color: 'danger',
  },
];

module.exports.findCommissionsStatus = (param) => {
  if (!param) throw new Error('param must be provided');
  if (typeof param === 'number') return status.find((s) => s.id === param);
  return status.find((s) => s.key === param);
};
