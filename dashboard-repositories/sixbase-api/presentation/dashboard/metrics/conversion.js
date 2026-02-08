const _ = require('lodash');
const { findSalesStatusByKey } = require('../../../status/salesStatus');

const calculatePercentage = (total, paid) => {
  if (total === 0) return '0%';
  return `${_.round((paid / total) * 100)
    .toFixed(2)
    .replace(/\.0+$/, '')}%`;
};

const filterByMethod = (metrics, paymentMethod) =>
  metrics.filter(({ method }) => method === paymentMethod);

const filterPaidByMethod = (metrics) =>
  metrics.filter(
    (metric) =>
      metric.sales_items[0].id_status === findSalesStatusByKey('paid').id,
  );

const serializeConversion = (metrics) => {
  const allBillets = filterByMethod(metrics, 'billet');
  const paidBillets = filterPaidByMethod(allBillets);
  const allCards = filterByMethod(metrics, 'card');
  const paidCards = filterPaidByMethod(allCards);
  const allPix = filterByMethod(metrics, 'pix');
  const paidPix = filterPaidByMethod(allPix);

  return {
    billet: {
      count_total: allBillets.length,
      count_paid: paidBillets.length,
      percentage: calculatePercentage(allBillets.length, paidBillets.length),
    },
    card: {
      count_total: allCards.length,
      count_paid: paidCards.length,
      percentage: calculatePercentage(allCards.length, paidCards.length),
    },
    pix: {
      count_total: allPix.length,
      count_paid: paidPix.length,
      percentage: calculatePercentage(allPix.length, paidPix.length),
    },
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializeConversion(this.data);
  }
};
