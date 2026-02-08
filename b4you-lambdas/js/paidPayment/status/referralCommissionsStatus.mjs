const status = [
  {
    id: 1,
    label: 'Pendente',
    key: 'pending',
  },
  {
    id: 2,
    label: 'Pendente de liberação',
    key: 'release-pending',
  },
  {
    id: 3,
    label: 'Pago',
    key: 'released',
  },
  {
    id: 4,
    label: 'Reembolsado',
    key: 'refund',
  },
  {
    id: 5,
    label: 'Chargeback',
    key: 'chargeback',
  },
  {
    id: 5,
    label: 'Negado',
    key: 'denied',
  },
  {
    id: 6,
    label: 'Expirado',
    key: 'expired',
  },
  {
    id: 7,
    label: 'Chargeback em disputa',
    key: 'chargeback_dispute',
  },
];
/**
 * @param param {('released' | 'refund' | 'chargeback'|  'denied' | 'expired' | 'pending' | 'release-pending')}
 *
 * */
export const findReferralCommissionStatus = (param) => {
  let key = 'id';
  if (typeof param === 'string') {
    key = 'key';
  }
  return status.find((s) => s[key] === param);
};
