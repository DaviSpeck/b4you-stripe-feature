const { findTransactionsWithdrawalType } = require('../../utils/transactionsWithdrawalType');
const { findTransactionStatus } = require('../../status/transactionStatus');

const serializeUserWithdrawals = (data) => {
  if (data.transaction) {
    const { id, bank_address, transaction } = data;

    transaction.status = findTransactionStatus(transaction.id_status);
    transaction.withdrawal_type = findTransactionsWithdrawalType(transaction.withdrawal_type) || null;

    delete transaction.id_status;

    return {
      id,
      bank_address,
      updated_at: transaction.updated_at,
      created_at: transaction.created_at,
      transaction,
    };
  }

  const status = data.status
    ? findTransactionStatus(data.status)
    : { id: 1, name: 'Pendente', key: 'pending' };

  const result = {
    id: data.id || 0,
    uuid: data.uuid || '',
    psp_id: data.psp_id || '',
    amount: parseFloat(data.amount) || 0,
    withdrawal_total: parseFloat(data.withdrawal_total) || 0,
    amount_net: parseFloat(data.amount_net) || 0,
    fee_total: parseFloat(data.fee_total) || 0,
    status,
    method: data.method || 'N/A',
    created_at: data.created_at || null,
    updated_at: data.updated_at || null,
    release_date: data.release_date || null,
    released: Boolean(data.released),
    bank_data: {
      bank_code: data.bank_code || null,
      agency: data.agency || null,
      account_number: data.account_number || null,
      account_type: data.account_type || null,
      operation: data.operation || null,
      recipient_name: data.recipient_name || null,
      document_number: data.document_number || null,
    },
  };

  return result;
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeUserWithdrawals);
    }
    return serializeUserWithdrawals(this.data);
  }
};
