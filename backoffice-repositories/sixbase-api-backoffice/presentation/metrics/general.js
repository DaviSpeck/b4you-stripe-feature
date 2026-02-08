const rawData = require('../../database/rawData');
const _ = require('lodash');

const calculatePercentage = (total, pay) =>
  pay ? Number(((100 * pay.amount) / total).toFixed(2)) : 0;

const calculateAmount = (pay) => (pay ? Number(pay.amount.toFixed(2)) : 0);

const serializeSums = (transactions) => {
  const groupAndSumByMethod = _(transactions)
    .groupBy('method')
    .map((amount, method) => ({
      method,
      amount: _.sumBy(amount, 'user_net_amount'),
    }))
    .value();
  const totalPaymentMethods = groupAndSumByMethod.reduce((acc, { amount }) => {
    return acc + amount;
  }, 0);
  const billet = groupAndSumByMethod.find(({ method }) => method === 'billet');
  const card = groupAndSumByMethod.find(({ method }) => method === 'card');
  const pix = groupAndSumByMethod.find(({ method }) => method === 'pix');
  return {
    total: Number(totalPaymentMethods.toFixed(2)),
    pix_total: calculateAmount(pix),
    pix_pencentage: calculatePercentage(totalPaymentMethods, pix),
    card: calculateAmount(card),
    card_percentage: calculatePercentage(totalPaymentMethods, card),
    billet: calculateAmount(billet),
    billet_percentage: calculatePercentage(totalPaymentMethods, billet),
  };
};

const serializeMetrics = ({ uuid, full_name, email, transactions }) => {
  return {
    uuid,
    full_name,
    email,
    summary: serializeSums(rawData(transactions)),
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeMetrics);
    }
    return serializeMetrics(this.data);
  }
};
