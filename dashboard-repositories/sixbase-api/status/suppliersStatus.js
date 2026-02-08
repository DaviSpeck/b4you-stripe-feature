const status = [
  {
    id: 1,
    label: 'Pendente',
    key: 'pending',
  },
  {
    id: 2,
    label: 'Aceito',
    key: 'approved',
  },
  {
    id: 3,
    label: 'Rejeitado',
    key: 'rejected',
  },
];

module.exports.findSupplierStatus = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  return status.find((s) => s[parameter] === type);
};

module.exports.findSupplierStatusByKey = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'key' : 'id';
  const selectedType = status.find((s) => s[parameter] === type);
  return selectedType;
};
