const _ = require('lodash');
const { findSalesStatusByKey } = require('../../status/salesStatus');

const calculatePercentage = (method, metrics) => {
  metrics = metrics.filter(
    (metric) =>
      metric.sales_items[0].id_status === findSalesStatusByKey('paid').id ||
      (metric.sales_items[0].id_status ===
        findSalesStatusByKey('refunded').id &&
        metric.released),
  );
  if (metrics.length === 0) return '0%';
  return `${_.round((method.length / metrics.length) * 100)
    .toFixed(2)
    .replace(/\.0+$/, '')}%`;
};

const calculateAmount = (method) =>
  method.reduce((acc, { user_net_amount }) => {
    acc += user_net_amount;
    return parseFloat(acc.toFixed(2));
  }, 0);

module.exports = { calculatePercentage, calculateAmount };
