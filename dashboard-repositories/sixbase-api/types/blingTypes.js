const blingTypes = [
  {
    id: 0,
    name: 'Pagamento aprovado',
  },
  // {
  //   id: 1,
  //   name: 'Após entrega do produto',
  // },
  {
    id: 2,
    name: 'Não emitir',
  },
];

const findBlingType = (type) => {
  const parameter = typeof type === 'string' ? 'name' : 'id';
  const selectedType = blingTypes.find((s) => s[parameter] === type);
  return selectedType;
};

module.exports = {
  blingTypes,
  findBlingType,
};
