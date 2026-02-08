const { findBank } = require('../../utils/banks');

const serializeBankAccount = ({
  bank_code,
  agency,
  account_number,
  account_type,
  operation,
}) => ({
  bank_code,
  bank: bank_code ? findBank(bank_code) : null,
  agency,
  account_number,
  account_type,
  operation,
});

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeBankAccount);
    }
    return serializeBankAccount(this.data);
  }
};
