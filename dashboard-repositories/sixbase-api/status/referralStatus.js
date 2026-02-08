const status = [
  {
    id: 1,
    key: 'active',
    label: 'Ativo',
  },
  {
    id: 2,
    key: 'blocked',
    label: 'Bloqueado',
  },
  {
    id: 3,
    key: 'canceled',
    label: 'Cancelado',
  },
];

module.exports.findReferralStatus = (param) => {
  let key = 'key';
  if (typeof param === 'number') {
    key = 'id';
  }
  return status.find((s) => s[key] === param);
};
