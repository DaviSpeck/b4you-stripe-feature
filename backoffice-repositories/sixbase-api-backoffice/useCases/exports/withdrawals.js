const ExportToExcel = require('../../utils/helpers/excel');
const dateHelper = require('../../utils/helpers/date');
const { FRONTEND_DATE } = require('../../types/dateTypes');
const { formatBRL } = require('../../utils/formatters');

const getHeaders = () => [
  {
    key: 'PSP ID',
    width: 0,
  },
  {
    key: 'STATUS',
    width: 0,
  },
  {
    key: 'SAQUE',
    width: 0,
  },
  {
    key: 'SAQUE C/ TARIFA',
    width: 0,
  },
  {
    key: 'TARIFA',
    width: 0,
  },
  {
    key: 'SOLICITADO',
    width: 0,
  },
  {
    key: 'ATUALIZADO',
    width: 0,
  },
  {
    key: 'AGENCIA',
    width: 0,
  },
  {
    key: 'NUMERO DA CONTA',
    width: 0,
  },
  {
    key: 'BANCO',
    width: 0,
  },
  {
    key: 'TIPO',
    width: 0,
  },
];

const dataToExport = (withdrawals) => {
  if (withdrawals.length === 0) return [];
  return withdrawals.map(({ transaction, bank_address }) => [
    transaction.psp_id,
    transaction.status.name,
    formatBRL(transaction.withdrawal_amount),
    formatBRL(transaction.withdrawal_total),
    formatBRL(transaction.revenue),
    dateHelper(transaction.created_at).format(FRONTEND_DATE),
    dateHelper(transaction.updated_at).format(FRONTEND_DATE),
    bank_address.account_agency,
    bank_address.account_number,
    bank_address.bank_name,
    transaction.method,
  ]);
};

module.exports = class ExportXLS {
  constructor(withdrawals) {
    this.withdrawals = withdrawals;
  }

  async execute() {
    const headers = getHeaders();
    const data = dataToExport(this.withdrawals);
    const file = await new ExportToExcel('b4you', headers, data).execute();
    return file;
  }
};
