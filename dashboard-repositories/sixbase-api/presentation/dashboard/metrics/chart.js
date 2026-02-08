const _ = require('lodash');
const DateHelper = require('../../../utils/helpers/date');
const {
  DATABASE_DATE_WITHOUT_TIME,
  FRONTEND_DATE_WITHOUT_TIME,
} = require('../../../types/dateTypes');

const filterMetricsByProduct = (metrics) => {
  const newMetrics = metrics.map((metric) => ({
    ...metric,
    sales_items: metric.sales_items[0],
  }));
  return _.chain(newMetrics)
    .groupBy('sales_items.id_product')
    .map((values) => ({
      name: values[0].sales_items.product.name,
      uuid: values[0].sales_items.product.uuid,
      hex_color: values[0].sales_items.product.hex_color,
      data: values,
    }))
    .value();
};

const enumerateDaysBetweenDates = (startDate, endDate) => {
  const now = startDate;
  const dates = [];
  while (now.isBefore(endDate) || now.isSame(endDate)) {
    dates.push(now.format(DATABASE_DATE_WITHOUT_TIME));
    now.add(1, 'days');
  }
  return dates;
};

const generateMetrics = (dates, metrics) => {
  const products = [];
  metrics.forEach((metric) => {
    const rawProduct = {
      name: metric.name,
      hex_color: metric.hex_color,
      data: [],
    };
    dates.forEach((date, index) => {
      const sum = metric.data.filter(
        (value) =>
          DateHelper(value.created_at).format(DATABASE_DATE_WITHOUT_TIME) ===
          date,
      );
      const reducedSum = sum.reduce((acc, value) => {
        acc += value.user_net_amount;
        return acc;
      }, 0);
      rawProduct.data[index] = Number(reducedSum.toFixed(2));
    });
    products.push(rawProduct);
  });
  return products;
};

const generateFrontendDates = (dates) =>
  dates.map((date) => DateHelper(date).format(FRONTEND_DATE_WITHOUT_TIME));

const serializeChart = (transactions, start_date, end_date) => {
  const dates = enumerateDaysBetweenDates(start_date, end_date);
  const filteredByProduct = filterMetricsByProduct(transactions);
  return {
    products: generateMetrics(dates, filteredByProduct),
    dates: generateFrontendDates(dates),
  };
};

module.exports = class {
  constructor(data, start_date, end_date) {
    this.data = data;
    this.start_date = DateHelper(start_date).startOf('day');
    this.end_date = DateHelper(end_date).endOf('day');
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializeChart(this.data, this.start_date, this.end_date);
  }
};
