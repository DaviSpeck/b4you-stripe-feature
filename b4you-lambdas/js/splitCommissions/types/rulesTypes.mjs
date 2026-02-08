const integrationRulesTypes = [
  {
    id: 1,
    label: 'Compra aprovada',
    key: 'approved-payment',
  },
  {
    id: 2,
    label: 'Compra recusada',
    key: 'refused-payment',
  },
  {
    id: 3,
    label: 'Reembolso',
    key: 'refund',
  },
  {
    id: 4,
    label: 'Chargeback',
    key: 'chargeback',
  },
  {
    id: 5,
    label: 'Carrinho abandonado',
    key: 'abandoned-cart',
  },
  {
    id: 6,
    label: 'Boleto gerado',
    key: 'generated-billet',
  },
  {
    id: 7,
    label: 'Pix gerado',
    key: 'generated-pix',
  },
  {
    id: 8,
    label: 'Assinatura cancelada',
    key: 'canceled-subscription',
  },
  {
    id: 9,
    label: 'Assinatura atrasada',
    key: 'late-subscription',
  },
  {
    id: 10,
    label: 'Assinatura renovada',
    key: 'renewed-subscription',
  },
];

export const findRulesTypes = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'label' : 'id';
  const selectedType = integrationRulesTypes.find((s) => s[parameter] === type);
  return selectedType;
};

export const findRulesTypesByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be a string');
  return integrationRulesTypes.find((s) => s.key === key);
};
