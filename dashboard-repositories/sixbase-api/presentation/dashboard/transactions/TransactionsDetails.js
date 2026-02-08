const { findTransactionStatus } = require('../../../status/transactionStatus');
const { findRoleType } = require('../../../types/roles');
const { findTransactionType } = require('../../../types/transactionTypes');

const serializeTransaction = (transaction) => {
  const { uuid, id_status, id_role, id_type, user_net_amount, created_at } =
    transaction;
  return {
    uuid,
    type: findTransactionType(id_type),
    role: id_role && findRoleType(id_role),
    status: findTransactionStatus(id_status),
    amount: user_net_amount,
    created_at,
  };
};

const serializeTransactionDetails = (transaction) => {
  const { sales_items } = transaction;
  if (sales_items.length === 0) return [];
  return sales_items[0].transactions.map((t) => serializeTransaction(t));
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeTransactionDetails);
    }
    return serializeTransactionDetails(this.data);
  }
};
