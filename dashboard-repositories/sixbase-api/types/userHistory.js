const userHistoryTypes = [
  {
    id: 1,
    label: 'Alteração de e-mail',
    key: 'mail-update',
  },
  {
    id: 2,
    label: 'Reembolso',
    key: 'refund',
  },
  {
    id: 3,
    label: 'Código de Segurança',
    key: 'code',
  },
];

const findUserHistoryType = (type) => {
  const parameter = typeof type === 'string' ? 'name' : 'id';
  return userHistoryTypes.find((s) => s[parameter] === type);
};

const findUserHistoryTypeByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be a string');
  return userHistoryTypes.find((s) => s.key === key);
};

module.exports = {
  userHistoryTypes,
  findUserHistoryType,
  findUserHistoryTypeByKey,
};
