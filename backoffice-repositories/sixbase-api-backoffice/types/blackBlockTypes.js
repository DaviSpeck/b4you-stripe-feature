const blackBlockTypes = [
  {
    id: 1,
    label: 'IP',
    key: 'ip',
  },
  {
    id: 2,
    label: 'CPF',
    key: 'cpf',
  },
  {
    id: 3,
    label: 'WHATSAPP',
    key: 'whatsapp',
  },
  {
    id: 4,
    label: 'EMAIL',
    key: 'email',
  },
  {
    id: 5,
    label: 'ENDERECO',
    key: 'address',
  },
  {
    id: 6,
    label: 'CEP',
    key: 'cep',
  },
];

const findTypeBlockByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return blackBlockTypes.find((s) => s.key === key);
};

module.exports = {
  blackBlockTypes,
  findTypeBlockByKey,
};
