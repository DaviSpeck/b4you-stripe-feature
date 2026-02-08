const shippingTypes = [
  {
    id: 0,
    key: 'free',
    label: 'Grátis',
  },
  { 
    id: 1,
    key: 'with-affiliate',
    label: 'Frete com divisão afiliado',
  },
  {
    id: 2,
    key: 'without-affiliate',
    label: 'Frete sem divisão afiliado',
  }, 
  {
    id: 3,
    key: 'no-division',
    label: 'Frete sem divisão',
  }
]

module.exports.findShippingType = (parameter) => {
  if(typeof parameter === 'string') return shippingTypes.find(t => t.key === parameter);
  return shippingTypes.find(t => t.id === parameter);
}
