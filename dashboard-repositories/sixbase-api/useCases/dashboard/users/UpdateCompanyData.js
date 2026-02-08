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
      whatsapp,
      bank_code,
      agency,
      account_number,
      account_type,
      birth_date,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipcode,
      annual_revenue,
    },
  ) {
    super(id_user, {
      company_name,
      cnpj,
      trading_name,
      whatsapp,
      bank_code,
      agency,
      account_number,
      account_type,
      birth_date,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipcode,
      annual_revenue,
    });
  }

  async execute() {
    const {
      cnpj,
      annual_revenue,
      trading_name,
      whatsapp,
      bank_code,
      agency,
      account_number,
      account_type,
      birth_date,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipcode,
    } = this.data;
    const { rawDocument } = validateAndFormatDocument(cnpj);
    this.data = {
      ...this.data,
      cnpj: rawDocument,
      status_cnpj: ANALYSIS.id,
      cnpj_requested_at: date().now(),
      trade_name: trading_name,
      whatsapp: whatsapp.replace(/\D/g, ''),
      birth_date: date(birth_date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipcode,
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
