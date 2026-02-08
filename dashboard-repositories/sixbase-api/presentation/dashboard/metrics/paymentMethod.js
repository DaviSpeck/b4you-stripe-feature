const { calculateAmount, calculatePercentage } = require('../common');
const { findSalesStatusByKey } = require('../../../status/salesStatus');

const filterByMethod = (method, metrics) =>
  metrics.filter(
    (metric) =>
      metric.method === method &&
      (metric.sales_items[0].id_status === findSalesStatusByKey('paid').id ||
        (metric.sales_items[0].id_status ===
          findSalesStatusByKey('refunded').id &&
          metric.released)),
  );

const serializePaymentMethods = (metrics) => {
  const card = filterByMethod('card', metrics);
  const billet = filterByMethod('billet', metrics);
  const pix = filterByMethod('pix', metrics);
  return {
    card: {
      amount: calculateAmount(card),
      count: card.length,
      percentage: calculatePercentage(card, metrics),
    },
    billet: {
      amount: calculateAmount(billet),
      count: billet.length,
      percentage: calculatePercentage(billet, metrics),
    },
    pix: {
      amount: calculateAmount(pix),
      count: pix.length,
      percentage: calculatePercentage(pix, metrics),
    },
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializePaymentMethods(this.data);
  }
};
