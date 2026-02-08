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
  },
  {
    id: 3,
    label: 'Paga',
    key: 'released',
  },
  {
    id: 4,
    label: 'Reembolsada',
    key: 'refunded',
  },
  {
    id: 5,
    label: 'Chargeback',
    key: 'chargeback',
  },
  {
    id: 6,
    label: 'Chargeback em disputa',
    key: 'chargeback_dispute',
  },
];

export const findCommissionsStatus = (param) => {
  if (!param) throw new Error('param must be provided');
  if (typeof param === 'number') return status.find((s) => s.id === param);
  return status.find((s) => s.key === param);
};
