const kycStatus = [
  {
    id: 0,
    label: 'Não cadastrado/Iniciado',
    label1: 'Pendente',
    key: 'pending',
    color: 'light',
  },
  {
    id: 3,
    label: 'Aprovado',
    key: 'approved',
    color: 'success',
  },
  {
    id: 4,
    label: 'Negado',
    key: 'denied',
    color: 'warning',
  },
];

const findKycStatus = (type) => {
  if (type === null || type === undefined)
    throw new Error('type must be provided');

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
