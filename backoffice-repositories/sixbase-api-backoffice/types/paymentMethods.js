const paymentMethods = [
  {
    id: 1,
    key: 'billet',
    label: 'Boleto',
  },
  {
    id: 2,
    key: 'card',
    label: 'Cartão de Crédito',
  },
  {
    id: 3,
    key: 'pix',
    label: 'Pix',
  },
];

const findPaymentMethods = (type) => {
  if (!type) return { id: 0, key: 'unknown', label: 'Não informado' };
  if (typeof type !== 'string' && typeof type !== 'number')
    return { id: 0, key: 'unknown', label: 'Inválido' };
  const parameter = typeof type === 'string' ? 'key' : 'id';
  const selectedType = paymentMethods.find((s) => s[parameter] === type);
  const result = selectedType || {
    id: 0,
    key: 'unknown',
    label: 'Desconhecido',
  };

  return result;
};

module.exports = {
  paymentMethods,
  findPaymentMethods,
};
