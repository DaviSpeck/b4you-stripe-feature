const blackBlockReasons = [
  {
    id: 1,
    label: 'Chargeback',
    key: 'chargeback',
  },
  {
    id: 2,
    label: 'Incluido pelo suporte',
    key: 'support',
  },
];

const findBlockReasonByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return blackBlockReasons.find((s) => s.key === key);
};

module.exports = {
  blackBlockReasons,
  findBlockReasonByKey,
};
