const rolesTypes = [
  {
    id: 1,
    key: 'producer',
    label: 'Produtor',
  },
  {
    id: 2,
    label: 'Coprodutor',
    key: 'coproducer',
  },
  {
    id: 3,
    label: 'Afiliado',
    key: 'affiliate',
  },
  {
    id: 4,
    label: 'Fornecedor',
    key: 'supplier',
  },
  {
    id: 5,
    label: 'Gerente',
    key: 'manager',
  },
];

const findRoleType = (role) => {
  if (!role) return { id: 0, key: 'unknown', label: 'Não informado' };
  if (typeof role !== 'string' && typeof role !== 'number')
    return { id: 0, key: 'invalid', label: 'Inválido' };
  const parameter = typeof role === 'string' ? 'label' : 'id';
  const found = rolesTypes.find((s) => s[parameter] === role);
  return found || { id: 0, key: 'unknown', label: 'Desconhecido' };
};

const findRoleTypeByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return rolesTypes.find((s) => s.key === key);
};

module.exports = {
  rolesTypes,
  findRoleType,
  findRoleTypeByKey,
};
