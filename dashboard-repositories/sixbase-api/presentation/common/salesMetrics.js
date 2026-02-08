const { findSalesStatusByKey } = require('../../status/salesStatus');

const filterSales = (sales, status) => {
  const statuses = [];
  if (Array.isArray(status)) {
    statuses.push(...status);
  } else {
    statuses.push(status);
  }
  return sales.filter(({ id_status }) => statuses.includes(id_status));
};

const filterByMethod = (sales, method) =>
  sales.filter((s) => s.payment_method === method);

const reduceSales = (sales) =>
  sales.reduce(
    (acc, { commissions }) => {
      acc.total += commissions[0].amount;
      acc.count += 1;
      return acc;
    },
    { total: 0, count: 0 },
  );

const reduceGrossTotal = (sales) =>
  sales.reduce((acc, { price_product }) => {
    acc += price_product;
    return acc;
  }, 0);

const serializeSalesMetrics = (salesItems) => {
  const confirmed = filterSales(salesItems, [
    findSalesStatusByKey('paid').id,
    findSalesStatusByKey('request-refund').id,
  ]);
  const refund = filterSales(salesItems, findSalesStatusByKey('refunded').id);
  const pending = filterSales(salesItems, findSalesStatusByKey('pending').id);
  const expired = filterSales(salesItems, findSalesStatusByKey('expired').id);
  const denied = filterSales(salesItems, findSalesStatusByKey('denied').id);
  const confirmedMetrics = reduceSales(confirmed);
  const refundMetrics = reduceSales(refund);
  const pendingMetrics = reduceSales(pending);
  const pix = {
    confirmed: reduceSales(filterByMethod(confirmed, 'pix')),
    expired: reduceSales(filterByMethod(expired, 'pix')),
    waiting: reduceSales(filterByMethod(pending, 'pix')),
  };
  const card = {
    confirmed: reduceSales(filterByMethod(confirmed, 'card')),
    denied: reduceSales(filterByMethod(denied, 'card')),
  };
  const billet = {
    confirmed: reduceSales(filterByMethod(confirmed, 'billet')),
    expired: reduceSales(filterByMethod(expired, 'billet')),
    waiting: reduceSales(filterByMethod(pending, 'billet')),
  };

  return {
    total: confirmedMetrics.total,
    paid: {
      total: confirmedMetrics.total,
      count: confirmedMetrics.count,
    },
    refund: {
      total: refundMetrics.total,
      count: refundMetrics.count,
    },
    pending: {
      total: pendingMetrics.total,
      count: pendingMetrics.count,
    },
    pix,
    card,
    billet,
    gross_total: reduceGrossTotal(confirmed),
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializeSalesMetrics(this.data);
  }
};
