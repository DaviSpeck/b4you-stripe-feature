const notificationTypes = [
  {
    id: 1,
    label: 'Vendas',
    key: 'sales',
  },
  {
    id: 2,
    label: 'Saques',
    key: 'withdrawals',
  },
  {
    id: 3,
    label: 'Coprodução',
    key: 'coproductions',
  },
  {
    id: 4,
    label: 'Afiliados',
    key: 'affiliates',
  },
  {
    id: 5,
    label: 'Documentos',
    key: 'documents',
  },
  {
    id: 6,
    label: 'Reembolso',
    key: 'refund',
  },
  {
    id: 7,
    label: 'Integrações',
    key: 'apps',
  },
  {
    id: 8,
    label: 'Produtos',
    key: 'products',
  },
  {
    id: 9,
    label: 'Assinaturas',
    key: 'subscriptions',
  },
  {
    id: 10,
    label: 'Notas Fiscais',
    key: 'invoices',
  },
  {
    id: 11,
    label: 'Perguntas',
    key: 'Questions',
  },
  {
    id: 12,
    label: 'Outros',
    key: 'blank',
  },
  {
    id: 13,
    label: 'Perguntas',
    key: 'questions',
  },
];

export const findNotificationType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'label' : 'id';
  return notificationTypes.find((s) => s[parameter] === type);
};
