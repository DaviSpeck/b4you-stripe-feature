const serializeSingleBalance = ({ amount }) => amount;

module.exports = class {
  constructor(balance) {
    this.balance = balance;
  }

  adapt() {
    if (!this.balance)
      throw new Error('Expect data to be not undefined or null');
    return serializeSingleBalance(this.balance);
  }
};
