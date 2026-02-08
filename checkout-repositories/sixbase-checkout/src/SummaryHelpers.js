export const parsePrice = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return Number(value) || 0;

  // Trata strings com padrão brasileiro (R$ 1.234,56 ou 1.234,56 ou 1234,56)
  const cleaned = value.replace(/[^\d,.-]/g, ''); // Mantém apenas dígitos, ponto, vírgula e hífen
  if (!cleaned) return 0;

  // Se tem vírgula e ponto, assumimos que ponto é milhar e vírgula é decimal
  if (cleaned.includes(',') && cleaned.includes('.')) {
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
  }
  // Se tem apenas vírgula, assumimos que é decimal
  if (cleaned.includes(',')) {
    return parseFloat(cleaned.replace(',', '.'));
  }
  return parseFloat(cleaned);
};

export const totalBumps = (orderbumps) => {
  const uuids = [];
  let total = 0;

  for (const orderbump of orderbumps) {
    if (!uuids.includes(orderbump.uuid)) {
      total += parsePrice(orderbump.price) * (orderbump.quantity || 0);
      uuids.push(orderbump.uuid);
    }
  }
  return total;
};

export const calcSummary = (
  orderBumps,
  totalPrice,
  paymentMethod,
  coupon,
  offer,
  shipping_price
) => {
  const parsedTotalPrice = parsePrice(totalPrice);
  const bumpsTotal = totalBumps(orderBumps);
  const subTotal = parsedTotalPrice + bumpsTotal;

  let totalDiscounts = offer.discounts[paymentMethod] || 0;
  if (coupon && coupon.percentage > 0) {
    totalDiscounts += coupon.percentage;
  }

  const parsedShipping = parsePrice(shipping_price);

  let totalPriceFinal = subTotal * (1 - totalDiscounts / 100) + parsedShipping;

  if (coupon && coupon.amount) {
    totalPriceFinal -= parsePrice(coupon.amount);
  }

  return {
    totalPriceFinal,
    subTotal,
    totalDiscounts: subTotal - totalPriceFinal,
  };
};
