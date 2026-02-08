const rolesTypes = [
  {
    id: 1,
    label: 'Produtor',
    key: 'producer',
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

export const findRoleTypeByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return rolesTypes.find((s) => s.key === key);
};
