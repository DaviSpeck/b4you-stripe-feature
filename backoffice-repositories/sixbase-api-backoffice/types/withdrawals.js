const withdrawalsTypes = [
  {
    id: 1,
    name: 'PIX',
    label: 'Pix',
  },
];

const findWithdrawalType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  return withdrawalsTypes.find((s) => s[parameter] === type);
};

module.exports = {
  withdrawalsTypes,
  findWithdrawalType,
};
