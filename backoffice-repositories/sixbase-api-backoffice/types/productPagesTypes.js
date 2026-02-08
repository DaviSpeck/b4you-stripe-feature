const types = [
  {
    id: 1,
    label: 'Outro',
    key: 'other',
  },
  {
    id: 2,
    label: 'Venda',
    key: 'sale',
  },
  {
    id: 3,
    label: 'Conteúdo',
    key: 'content',
  },
  {
    id: 4,
    label: 'Captura',
    key: 'lead',
  },
];

/**
 *
 * @param {string} key
 */
module.exports.findProductPageTypeByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be a string');
  return types.find((s) => s.key === key);
};

/**
 *
 * @param {number} id
 */
module.exports.findProductPageTypeByID = (id) => {
  if (!id) throw new Error('id must be provided');
  if (typeof id !== 'number') throw new Error('id must be a number');
  return types.find((s) => s.id === id);
};
