const saleBlocksStatus = [
  {
    id: 1,
    label: 'Pendente de análise',
    key: 'pending',
  },
  {
    id: 2,
    label: 'Reembolsada pelo suporte',
    key: 'refunded',
  },
  {
    id: 3,
    label: 'Confiável',
    key: 'trust',
  },
];

const findsaleBlocksStatusByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return saleBlocksStatus.find((s) => s.key === key);
};

module.exports = {
  saleBlocksStatus,
  findsaleBlocksStatusByKey,
};
