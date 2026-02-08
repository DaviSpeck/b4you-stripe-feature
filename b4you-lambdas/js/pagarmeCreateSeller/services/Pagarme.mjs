import { HttpClient } from './HTTPClient.mjs';
import moment from 'moment';

const { PAGARME_URL, PAGARME_PASSWORD, PAGARME_PASSWORD_3 } = process.env;

export class Pagarme {
  #service;

  constructor(provider) {
    let PASSWORD = null;
    if (provider === 'B4YOU_PAGARME_2') {
      PASSWORD = PAGARME_PASSWORD;
    } else {
      PASSWORD = PAGARME_PASSWORD_3;
    }

    this.headers = {
      'Authorization': `Basic ${Buffer.from(`${PASSWORD}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    };
    this.#service = new HttpClient({
      baseURL: PAGARME_URL,
    });
  }

  /**
   * Cria um vendedor utilizando CPF.
   *
   * @param {Object} params - Parâmetros para criação do vendedor.
   * @param {string} params.email - Email do vendedor.
   * @param {string} params.document - CPF do vendedor.
   * @param {string} params.phone - Telefone do vendedor.
   * @param {string} params.full_name - Nome completo do vendedor.
   * @param {string} params.birthdate - Data de nascimento do vendedor (YYYY-MM-DD).
   * @param {string} params.revenue - Renda mensal do vendedor.
   * @param {string} params.occupation - Ocupação profissional do vendedor.
   * @param {Object} params.bank_account - Informações da conta bancária.
   * @param {string} params.bank_account.holder_name - Nome do titular da conta.
   * @param {string} params.bank_account.bank_code - Código do banco.
   * @param {string} params.bank_account.agency - Agência bancária.
   * @param {string} params.bank_account.account - Número da conta.
   * @param {string} params.bank_account.account_digit - Dígito verificador da conta.
   * @param {string} params.bank_account.type - Tipo da conta (ex: "checking").
   * @param {Object} params.address - Endereço do vendedor.
   * @returns {Promise<string>} - Retorna o ID do vendedor criado.
   */
  async createSellerCPF({
    email,
    document,
    phone,
    full_name,
    birthdate,
    revenue,
    occupation,
    bank_account: { holder_name, bank_code, agency, account, account_digit, type },
    address,
  }) {
    const body = {
      register_information: {
        email,
        document,
        type: 'individual',
        name: full_name.substring(0, 30),
        birthdate: moment(birthdate, 'YYYY-MM-DD').format('DD/MM/YYYY'),
        monthly_income: revenue,
        professional_occupation: occupation,
        phone_numbers: [
          {
            ddd: phone.replace(/\s+/g, '').replace(/-/g, '').slice(0, 2),
            number: phone.replace(/\s+/g, '').replace(/-/g, '').slice(2),
            type: 'mobile',
          },
        ],
        address,
      },
      default_bank_account: {
        holder_name: holder_name.substring(0, 30),
        holder_type: 'individual',
        holder_document: document,
        bank: bank_code,
        branch_number: agency,
        account_number: account,
        account_check_digit: account_digit,
        type,
      },
      automatic_anticipation_settings: {
        enabled: true,
        type: '1025',
        delay: '15',
        volume_percentage: '100',
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
          26, 27, 28, 29, 30, 31,
        ],
      },
    };

    const response = await this.#service.post('/recipients', body, {
      headers: this.headers,
    });
    return response.data.id;
  }

  /**
   * Cria um vendedor utilizando CNPJ.
   *
   * @param {Object} params - Parâmetros para criação do vendedor.
   * @param {string} params.name - Nome do representante legal.
   * @param {string} params.email - Email do vendedor.
   * @param {string} params.cpf - CPF do representante legal.
   * @param {string} params.cnpj - CNPJ da empresa.
   * @param {Object} params.address - Endereço da empresa.
   * @param {string} params.company_name - Razão social da empresa.
   * @param {string} params.trading_name - Nome fantasia da empresa.
   * @param {string} params.annual_revenue - Receita anual da empresa.
   * @param {string} params.phone - Telefone do representante legal.
   * @param {string} params.birthdate - Data de nascimento do representante legal (YYYY-MM-DD).
   * @param {string} params.monthly_income - Renda mensal do representante legal.
   * @param {string} params.professional_occupation - Ocupação profissional do representante legal.
   * @param {Object} params.bank_account - Informações da conta bancária.
   * @param {string} params.bank_account.holder_name - Nome do titular da conta.
   * @param {string} params.bank_account.bank_code - Código do banco.
   * @param {string} params.bank_account.agency - Agência bancária.
   * @param {string} params.bank_account.account - Número da conta.
   * @param {string} params.bank_account.account_digit - Dígito verificador da conta.
   * @param {string} params.bank_account.type - Tipo da conta (ex: "checking").
   * @returns {Promise<Object>} - Retorna os dados do vendedor criado.
   */
  async createSellerCNPJ({
    name,
    email,
    cpf,
    cnpj,
    address,
    company_name,
    trading_name,
    annual_revenue,
    phone,
    birthdate,
    monthly_income,
    company_type,
    founding_date,
    professional_occupation,
    bank_account: { holder_name, bank_code, agency, account, account_digit, type },
  }) {
    const body = {
      register_information: {
        email,
        document: cnpj,
        type: 'corporation',
        corporation_type: company_type,
        main_address: address,
        company_name,
        trading_name,
        annual_revenue,
        founding_date,
        phone_numbers: [
          {
            ddd: phone.replace(/\s+/g, '').replace(/-/g, '').slice(0, 2),
            number: phone.replace(/\s+/g, '').replace(/-/g, '').slice(2),
            type: 'mobile',
          },
        ],
        managing_partners: [
          {
            name: name.substring(0, 30),
            email,
            document: cpf,
            birthdate: moment(birthdate, 'YYYY-MM-DD').format('DD/MM/YYYY'),
            monthly_income,
            self_declared_legal_representative: true,
            address,
            professional_occupation,
            phone_numbers: [
              {
                ddd: phone.replace(/\s+/g, '').replace(/-/g, '').slice(0, 2),
                number: phone.replace(/\s+/g, '').replace(/-/g, '').slice(2),
                type: 'mobile',
              },
            ],
          },
        ],
      },
      default_bank_account: {
        holder_name: holder_name.substring(0, 30),
        holder_type: 'company',
        holder_document: cnpj,
        bank: bank_code,
        branch_number: agency,
        account_number: account,
        account_check_digit: account_digit,
        type,
      },
      automatic_anticipation_settings: {
        enabled: true,
        type: '1025',
        delay: '15',
        volume_percentage: '100',
        days: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
          26, 27, 28, 29, 30, 31,
        ],
      },
    };

    const response = await this.#service.post('/recipients', body, {
      headers: this.headers,
    });
    console.log(response.data.id);
    return response.data.id;
  }
}
