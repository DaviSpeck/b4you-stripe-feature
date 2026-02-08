const chargeStatus = [
  {
    id: 1,
    label: 'Pendente',
    color: 'light',
    key: 'pending',
  },
  {
    id: 2,
    label: 'Pago',
    color: 'success',
    key: 'paid',
  },
  {
    id: 3,
    label: 'Cancelado',
    color: 'danger',
    key: 'canceled',
  },
  {
    id: 4,
    label: 'Recusado',
    color: 'danger',
    key: 'refused',
  },
  {
    id: 5,
    label: 'Reembolsado',
    color: 'danger',
    key: 'refunded',
  },
  {
    id: 6,
    label: 'Expirado',
    color: 'danger',
    key: 'expired',
  },
  {
    id: 7,
    label: 'Chargeback',
    color: 'danger',
    key: 'chargeback',
  },
  {
    id: 8,
    label: 'Chargeback em disputa',
    color: 'danger',
    key: 'chargeback_dispute',
  },
];

export const findChargeStatusByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return chargeStatus.find((s) => s.key === key);
};
