const status = [
  {
    id: 1,
    key: 'active',
    label: 'Ativo',
    color: '#00FF00', // Green
  },
  {
    id: 2,
    key: 'blocked',
    label: 'Bloqueado',
    color: '#FFA500', // Orange
  },
  {
    id: 3,
    key: 'canceled',
    label: 'Cancelado',
    color: '#FF0000', // Red
  },
];

module.exports.findReferralStatus = (param) => {
  let key = 'key';
  if (typeof param === 'number') {
    key = 'id';
  }
  return status.find((s) => s[key] === param);
};
