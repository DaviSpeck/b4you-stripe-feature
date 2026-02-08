const invoiceTypes = [
  {
    id: 1,
    label: 'Nota Fiscal',
    type: 'invoice',
    key: 'invoice',
  },
  {
    id: 2,
    label: 'Recibo',
    type: 'receipt',
    key: 'receipt',
  },
];

const findInvoiceType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'type' : 'id';
  return invoiceTypes.find((s) => s[parameter] === type);
};

const findInvoiceTypeByKey = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'key' : 'id';
  const selectedType = invoiceTypes.find((s) => s[parameter] === type);
  return selectedType;
};
module.exports = {
  invoiceTypes,
  findInvoiceType,
  findInvoiceTypeByKey,
};
