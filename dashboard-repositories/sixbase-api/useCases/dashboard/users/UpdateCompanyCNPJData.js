const UpdateUserData = require('./UpdateUserData');
const { documentsStatus } = require('../../../status/documentsStatus');
const { validateAndFormatDocument } = require('../../../utils/validations');
const date = require('../../../utils/helpers/date');

const [, ANALYSIS] = documentsStatus;

module.exports = class updateCompanyData extends UpdateUserData {
  constructor(
    id_user,
    {
      company_name,
      cnpj,
      trading_name,
      bank_code,
      agency,
      account_number,
      account_type,
      birth_date,
      annual_revenue,
    },
  ) {
    super(id_user, {
      company_name,
      cnpj,
      trading_name,
      bank_code,
      agency,
      account_number,
      account_type,
      birth_date,
      annual_revenue,
    });
  }

  async execute() {
    const {
      cnpj,
      annual_revenue,
      trading_name,
      bank_code,
      agency,
      account_number,
      account_type,
      birth_date,
    } = this.data;
    const { rawDocument } = validateAndFormatDocument(cnpj);
    this.data = {
      ...this.data,
      cnpj: rawDocument,
      status_cnpj: ANALYSIS.id,
      cnpj_requested_at: date().now(),
      trade_name: trading_name,
      birth_date: date(birth_date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      annual_revenue: parseFloat(
        annual_revenue.replace(/\./g, '').replace(',', '.'),
      ),
      company_bank_code: bank_code,
      company_agency: agency,
      company_account_number: account_number,
      company_account_type: account_type,
    };
    await this.save();
  }
};
