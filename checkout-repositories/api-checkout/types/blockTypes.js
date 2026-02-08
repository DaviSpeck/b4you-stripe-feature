const blockTypeTypes = [
  {
    id: 1,
    label: 'Endereço',
    key: 'address',
  },
  {
    id: 2,
    label: 'IP',
    key: 'ip',
  },
  {
    id: 3,
    label: 'Cartão',
    key: 'card',
  },
  {
    id: 4,
    label: 'Fingerprint',
    key: 'fingerprint',
  },
  {
    id: 5,
    label: 'Oferta/Email',
    key: 'offer-email',
  },
  {
    id: 6,
    label: 'Sessão',
    key: 'session',
  },
  {
    id: 7,
    label: 'CPF',
    key: 'cpf',
  },
  {
    id: 8,
    label: 'Oferta/Nome Comprador',
    key: 'offer-customer-name',
  },
];

const findBlockTypes = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'label' : 'id';
  const selectedType = blockTypeTypes.find((s) => s[parameter] === type);
  return selectedType;
};

const findBlockTypesByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be a string');
  return blockTypeTypes.find((s) => s.key === key);
};

module.exports = {
  blockTypeTypes,
  findBlockTypes,
  findBlockTypesByKey,
};
