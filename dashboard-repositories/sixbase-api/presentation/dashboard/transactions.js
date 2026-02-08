const { findTransactionStatus } = require('../../status/transactionStatus');
const {
  findTransactionType,
  findTransactionTypeByKey,
} = require('../../types/transactionTypes');

const resolveAmount = (
  id_type,
  { withdrawal_total, fee_total, user_net_amount },
) => {
  if (id_type === findTransactionTypeByKey('withdrawal').id)
    return withdrawal_total;
  if (id_type === findTransactionTypeByKey('cost_refund').id) return fee_total;
  return user_net_amount;
};

const serializeSingleTransaction = ({
  uuid,
  created_at,
  id_status,
  id_type,
  sales_items,
  ...rest
}) => ({
  uuid,
  status: findTransactionStatus(id_status),
  type: findTransactionType(id_type),
  amount: resolveAmount(id_type, rest),
  created_at,
});

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleTransaction);
    }
    return serializeSingleTransaction(this.data);
  }
};
