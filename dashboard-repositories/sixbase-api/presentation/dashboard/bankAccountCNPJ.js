const { findBank } = require('../../utils/banks');

const serializeBankAccountCNPJ = ({
  company_bank_code,
  company_agency,
  company_account_number,
  company_account_type,
}) => ({
  company_bank_code,
  company_bank: company_bank_code ? findBank(company_bank_code) : null,
  company_agency,
  company_account_number,
  company_account_type,
});

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeBankAccountCNPJ);
    }
    return serializeBankAccountCNPJ(this.data);
  }
};
