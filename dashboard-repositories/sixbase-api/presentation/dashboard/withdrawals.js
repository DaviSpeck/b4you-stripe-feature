const { findTransactionStatus } = require('../../status/transactionStatus');
const { capitalizeName } = require('../../utils/formatters');

const serializeWithdrawal = (withdrawal) => {
  const {
    bank_address: bank,
    transaction: { uuid, id_status, created_at, amount },
    user: { email, first_name, last_name },
  } = withdrawal;
  return {
    uuid,
    status: findTransactionStatus(id_status).name,
    amount,
    created_at,
    user_requested: {
      full_name: capitalizeName(`${first_name} ${last_name}`),
      email,
    },
    bank,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeWithdrawal);
    }
    return serializeWithdrawal(this.data);
  }
};
