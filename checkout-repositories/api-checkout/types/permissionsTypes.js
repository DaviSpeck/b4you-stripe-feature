const permissionTypes = [
  {
    id: 1,
    key: 'metrics',
    label: 'Dashboard',
  },
  {
    id: 2,
    key: 'market',
    label: 'Mercado',
  },
  {
    id: 3,
    key: 'products',
    label: 'Meus Produtos',
  },
  {
    id: 4,
    key: 'coproduction',
    label: 'Minhas Co-produções',
  },
  {
    id: 5,
    key: 'affiliates',
    label: 'Minhas Afiliações',
  },
  {
    id: 6,
    key: 'balance',
    label: 'Carteira',
  },
  {
    id: 7,
    key: 'sales',
    label: 'Vendas',
  },
  {
    id: 8,
    key: 'subscriptions',
    label: 'Assinaturas',
  },
  {
    id: 9,
    key: 'integrations',
    label: 'Apps',
  },
  {
    id: 10,
    key: 'settings',
    label: 'Configurações',
  },
  {
    id: 11,
    key: 'collaborators',
    label: 'Colaboradores',
  },
  {
    id: 12,
    key: 'withdrawals',
    label: 'Saques',
  },
  {
    id: 13,
    key: 'invoices',
    label: 'Notas Fiscais',
  },
];

const findPermissionType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string') throw new Error('type must be string');
  return permissionTypes.find((s) => s.key === type);
};

module.exports = {
  permissionTypes,
  findPermissionType,
};
