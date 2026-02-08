const serializeSingleBlockedTransactions = (transactions) => {
  if (!transactions) return 0;
  const blockedAmount = transactions.reduce((acc, { user_net_amount }) => {
    acc += user_net_amount;
    return acc;
  }, 0);
  return blockedAmount;
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializeSingleBlockedTransactions(this.data);
  }
};
