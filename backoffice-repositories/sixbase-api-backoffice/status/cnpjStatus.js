const documentsStatus = [
  {
    id: 1,
    label: 'Aguardando Envio',
    color: 'warning',
    key: 'waiting',
  },
  {
    id: 2,
    label: 'Em análise',
    color: 'info',
    key: 'analysis',
  },
  {
    id: 3,
    label: 'Aprovado',
    color: 'success',
    key: 'success',
  },
  {
    id: 4,
    label: 'Recusado',
    color: 'danger',
    key: 'rejected',
  },
];

const findCNPJStatus = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'label' : 'id';
  return documentsStatus.find((s) => s[parameter] === type);
};

const findCNPJStatusByKey = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'key' : 'id';
  return documentsStatus.find((s) => s[parameter] === type);
};

module.exports = {
  documentsStatus,
  findCNPJStatus,
  findCNPJStatusByKey,
};
