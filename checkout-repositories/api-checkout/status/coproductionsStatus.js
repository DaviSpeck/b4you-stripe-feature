const coproductionStatus = [
  {
    id: 1,
    name: 'Pendente',
    key: 'pending',
    color: 'light',
  },
  {
    id: 2,
    name: 'Ativo',
    key: 'active',
    color: 'success',
  },
  {
    id: 3,
    name: 'Rejeitado',
    key: 'reject',
    color: 'danger',
  },
  {
    id: 4,
    name: 'Expirado',
    key: 'expired',
    color: 'warning',
  },
  {
    id: 5,
    name: 'Rescindido',
    key: 'terminated',
    color: 'danger',
  },
  {
    id: 6,
    name: 'Cancelado',
    key: 'canceled',
    color: 'warning',
  },
];

const findCoproductionStatus = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  const selectedType = coproductionStatus.find((s) => s[parameter] === type);
  return selectedType;
};

const findCoproductionStatusByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return coproductionStatus.find((s) => s.key === key);
};

module.exports = {
  coproductionStatus,
  findCoproductionStatus,
  findCoproductionStatusByKey,
};
