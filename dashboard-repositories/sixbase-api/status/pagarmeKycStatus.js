const kycStatus = [
  {
    id: 0,
    label: 'Pendente',
    key: 'pending',
  },
  {
    id: 1,
    label: 'Processo iniciado',
    key: 'analysis',
  },
  {
    id: 2,
    label: 'Parcialmente negado',
    key: 'partially-denied',
  },
  {
    id: 3,
    label: 'Aprovado',
    key: 'approved',
  },
  {
    id: 4,
    label: 'Negado',
    key: 'denied',
  },
];

const findKycStatus = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'label' : 'id';
  return kycStatus.find((s) => s[parameter] === type);
};

const findKycStatusByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return kycStatus.find((s) => s.key === key);
};

module.exports = {
  kycStatus,
  findKycStatus,
  findKycStatusByKey,
};
