import { findSalesStatusByKey } from '../status/salesStatus.mjs';

const roleNames = {
  1: 'Produtor',
  2: 'Coprodutor',
  3: 'Afiliado',
  4: 'Fornecedor',
  5: 'Gerente',
};

const filterSales = (sales, status) => {
  const statuses = [];
  if (Array.isArray(status)) {
    statuses.push(...status);
  } else {
    statuses.push(status);
  }
  return sales.filter(({ id_status }) => statuses.includes(id_status));
};

const reduceSales = (sales) =>
  sales.reduce(
    (acc, { commissions }) => {
      acc.total += commissions[0].amount;
      acc.count += 1;
      return acc;
    },
    { total: 0, count: 0 }
  );

const reduceGrossTotal = (sales) =>
  sales.reduce((acc, { price_product }) => {
    acc += price_product;
    return acc;
  }, 0);

const calculateTotalByRole = (sales) => {
  const totalsByRole = sales.reduce((acc, sale) => {
    sale.commissions.forEach(({ id_role, amount }) => {
      if (!acc[id_role]) {
        acc[id_role] = 0;
      }
      acc[id_role] += amount;
    });
    return acc;
  }, {});

  return Object.entries(totalsByRole).map(([id_role, total]) => ({
    total: parseFloat(total.toFixed(2)),
    role: roleNames[id_role],
  }));
};
const serializeSalesMetrics = (salesItems) => {
  const confirmed = filterSales(salesItems, [
    findSalesStatusByKey('paid').id,
    findSalesStatusByKey('request-refund').id,
  ]);
  const confirmedMetrics = reduceSales(confirmed);

  return {
    gross_total: parseFloat(reduceGrossTotal(confirmed).toFixed(2)),
    net_total: parseFloat(confirmedMetrics.total.toFixed(2)),
    count: confirmedMetrics.count,
    commissions: calculateTotalByRole(salesItems),
  };
};

export default class SalesAdapter {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializeSalesMetrics(this.data);
  }
}
