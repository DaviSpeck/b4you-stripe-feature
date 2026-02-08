const status = [
  {
    id: 1,
    label: 'Pendente',
    key: 'pending',
    color: '#FFA500', // Orange
  },
  {
    id: 2,
    label: 'Pendente de liberação',
    key: 'release-pending',
    color: '#FFD700', // Gold
  },
  {
    id: 3,
    label: 'Pago',
    key: 'released',
    color: '#00FF00', // Green
  },
  {
    id: 4,
    label: 'Reembolsado',
    key: 'refund',
    color: '#FF0000', // Red
  },
  {
    id: 5,
    label: 'Chargeback',
    key: 'chargeback',
    color: '#8B0000', // Dark Red
  },
  {
    id: 6,
    label: 'Negado',
    key: 'denied',
    color: '#DC143C', // Crimson
  },
  {
    id: 7,
    label: 'Expirado',
    key: 'expired',
    color: '#808080', // Gray
  },
  {
    id: 8,
    label: 'Chargeback em disputa',
    key: 'chargeback_dispute',
    color: '#FF4500', // Orange Red
  },
];
/**
 * @param param {('released' | 'refund' | 'chargeback'|  'denied' | 'expired' | 'pending' | 'release-pending')}
 *
 * */
module.exports.findReferralCommissionStatus = (param) => {
  let key = 'id';
  if (typeof param === 'string') {
    key = 'key';
  }
  return status.find((s) => s[key] === param);
};
