const eNotasTypes = [
  {
    id: 0,
    name: 'Venda',
  },
  {
    id: 1,
    name: 'Após Garantia',
  },
  {
    id: 2,
    name: 'Não emitir',
  },
];

const findeNotasType = (type) => {
  const parameter = typeof type === 'string' ? 'name' : 'id';
  const selectedType = eNotasTypes.find((s) => s[parameter] === type);
  return selectedType;
};

module.exports = {
  eNotasTypes,
  findeNotasType,
};
