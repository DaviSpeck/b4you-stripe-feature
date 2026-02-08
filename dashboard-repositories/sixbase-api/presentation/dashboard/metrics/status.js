const _ = require('lodash');
const { findSalesStatusByKey } = require('../../../status/salesStatus');
const { calculateAmount } = require('../common');

const calculatePercentage = (method, total) => {
  if (total === 0) return '0%';
  return `${_.round((method.length / total) * 100, 1)}%`;
};

const filterByMethod = (status, metrics) =>
  metrics.filter(
    (metric) =>
      metric.sales_items[0].id_status === findSalesStatusByKey(status).id,
  );

const reduceSale = (metrics) =>
  metrics.reduce((acc, metric) => {
    acc += metric.sales_items[0].price;
    return acc;
  }, 0);

const serializeStatus = (metrics) => {
  const paid = filterByMethod('paid', metrics);
  const requestRefund = filterByMethod('request-refund', metrics);
  const approved = [...paid, ...requestRefund];
  const pending = filterByMethod('pending', metrics);
  const denied = filterByMethod('denied', metrics);
  const refund = filterByMethod('refunded', metrics);
  const chargeback = filterByMethod('chargeback', metrics);

  const total = metrics.length;

  const net_total = calculateAmount(approved);

  return {
    totals: {
      gross_total: reduceSale(approved),
      net_total,
      count: approved.length,
    },
    approved: {
      amount: net_total,
      count: approved.length,
      percentage: calculatePercentage(approved, total),
    },
    pending: {
      amount: calculateAmount(pending),
      count: pending.length,
      percentage: calculatePercentage(pending, total),
    },
    denied: {
      amount: calculateAmount(denied),
      count: denied.length,
      percentage: calculatePercentage(denied, total),
    },
    refund: {
      amount: calculateAmount(refund),
      count: refund.length,
      percentage: calculatePercentage(refund, total),
    },
    chargeback: {
      amount: calculateAmount(chargeback),
      count: chargeback.length,
      percentage: calculatePercentage(chargeback, total),
    },
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializeStatus(this.data);
  }
};
