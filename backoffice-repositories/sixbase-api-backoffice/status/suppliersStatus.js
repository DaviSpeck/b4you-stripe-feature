const status = [
  {
    id: 1,
    label: 'Pendente',
    key: 'pending',
    color: 'primary',
  },
  {
    id: 2,
    label: 'Aceito',
    key: 'approved',
    color: 'success',
  },
  {
    id: 3,
    label: 'Rejeitado',
    key: 'rejected',
    color: 'danger',
  },
];

module.exports.findSupplierStatus = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  return status.find((s) => s[parameter] === type);
};
