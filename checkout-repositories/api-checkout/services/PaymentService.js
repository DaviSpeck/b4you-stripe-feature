const { splitFullName } = require('../utils/formatters');

module.exports = class PaymentService {
  #service;

  constructor(service) {
    this.#service = service;
  }

  async generateCardSale(
    {
      transaction_id,
      price,
      installments = 1,
      products,
      commissions,
      statement_descriptor,
      operation_type = 'auth_and_capture',
      payments = null,
    },
    { provider_external_id, ip_client = null },
    cardData = {},
    address = {},
  ) {
    try {
      if (Array.isArray(payments) && payments.length > 0) {
        const mappedPayments = payments.map(
          ({
            amount,
            installments: paymentInstallments,
            card_number,
            card_holder,
            security_code,
            expiration_month,
            expiration_year,
            commissions: paymentCommissions,
          }) => ({
            amount,
            installments: paymentInstallments ?? installments,
            statement_descriptor: statement_descriptor || null,
            card: {
              number: card_number,
              cvv: security_code,
              month: expiration_month,
              year: expiration_year,
              name: card_holder,
            },
            splits: paymentCommissions,
          }),
        );

        const data = await this.#service.createOrder({
          customer: {
            provider_external_id,
            ip: ip_client,
            address,
          },
          items: products,
          amount: price,
          external_id: transaction_id,
          operation_type,
          payments: mappedPayments,
        });

        // Log do que está sendo enviado para o Pagarme
        // eslint-disable-next-line no-console
        console.log('=== PaymentService - Dados enviados para Pagarme ===');
        // eslint-disable-next-line no-console
        console.log('Número de pagamentos:', mappedPayments.length);
        // eslint-disable-next-line no-console
        console.log('Transaction ID:', transaction_id);
        // eslint-disable-next-line no-console
        console.log('Price total:', price);
        // eslint-disable-next-line no-console
        console.log('Provider External ID:', provider_external_id);
        mappedPayments.forEach((payment, index) => {
          // eslint-disable-next-line no-console
          console.log(`\n--- Payment ${index + 1} ---`);
          // eslint-disable-next-line no-console
          console.log('Amount:', payment.amount);
          // eslint-disable-next-line no-console
          console.log('Installments:', payment.installments);
          // eslint-disable-next-line no-console
          console.log('Card number (last 4):', payment.card?.number?.slice(-4));
          // eslint-disable-next-line no-console
          console.log(
            'Splits/Commissions:',
            JSON.stringify(payment.splits, null, 2),
          );
        });
        // eslint-disable-next-line no-console
        console.log(
          '\nPayments payload completo:',
          JSON.stringify(mappedPayments, null, 2),
        );
        // eslint-disable-next-line no-console
        console.log('===================================================');

        // Log do que retornou da Pagarme
        // eslint-disable-next-line no-console
        console.log('=== PaymentService - Resposta da Pagarme ===');
        // eslint-disable-next-line no-console
        console.log('Status:', data.status);
        // eslint-disable-next-line no-console
        console.log('Charges count:', data.charges?.length || 0);
        // eslint-disable-next-line no-console
        console.log('Full response:', JSON.stringify(data, null, 2));
        // eslint-disable-next-line no-console
        console.log('===========================================');

        return data;
      }

      const {
        card_number,
        cardholder_name,
        security_code,
        expiration_month,
        expiration_year,
      } = cardData;

      const data = await this.#service.createOrder({
        customer: {
          provider_external_id,
          ip: ip_client,
          address,
        },
        items: products,
        amount: price,
        external_id: transaction_id,
        splits: commissions,
        operation_type,
        card: {
          number: card_number,
          cvv: security_code,
          month: expiration_month,
          year: expiration_year,
          name: cardholder_name,
          installments,
          soft_descriptor: statement_descriptor || null,
        },
      });
      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error.response.data.errors);
      throw error;
    }
  }

  async generatePix({
    transaction_id,
    provider_external_id,
    amount,
    commissions,
    products,
    ip,
  }) {
    try {
      const data = await this.#service.createPix({
        customer: {
          provider_external_id,
          ip,
        },
        items: products,
        amount,
        external_id: transaction_id,
        splits: commissions,
      });
      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      throw error;
    }
  }

  async generateBillet({
    transaction_id,
    price,
    due_date,
    products,
    commissions,
    provider_external_id,
    ip,
  }) {
    try {
      const data = await this.#service.createBillet({
        customer: {
          provider_external_id,
          ip,
        },
        items: products,
        amount: price,
        external_id: transaction_id,
        splits: commissions,
        due_date,
      });
      return data;
    } catch (error) {
      return error;
    }
  }

  async generateCardSaleWithToken({
    transaction_id,
    price,
    installments = 1,
    products,
    commissions,
    statement_descriptor,
    provider_external_id,
    ip_client = null,
    token,
    address = {},
  }) {
    try {
      const data = await this.#service.createOrderWithToken({
        customer: {
          provider_external_id,
          ip: ip_client,
          address,
        },
        items: products,
        amount: price,
        external_id: transaction_id,
        splits: commissions,
        card: {
          token,
          installments,
          statement_descriptor,
        },
      });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async createClient({
    full_name,
    document_number,
    email,
    whatsapp,
    ip = null,
    address,
  }) {
    // eslint-disable-next-line no-console
    console.log('address ao criar client', address);
    const { firstName: first_name, lastName: last_name } =
      splitFullName(full_name);
    const data = await this.#service.createClient({
      first_name,
      last_name,
      document_number,
      email,
      whatsapp,
      ip,
      address,
    });
    return data;
  }

  async createCardToken({
    provider_external_id,
    card_number,
    card_holder,
    expiration_date,
    cvv,
  }) {
    const [month, year] = expiration_date.split('/');
    try {
      const data = await this.#service.createCardToken({
        provider_external_id,
        card_number,
        cvv,
        card_holder,
        month,
        year,
      });
      return { token: data.token };
    } catch (error) {
      throw error;
    }
  }

  async updateCard({ charge_id, card_number, card_holder, year, month, cvv }) {
    try {
      const data = await this.#service.updateCreditCard({
        card_number,
        cvv,
        month,
        year,
        card_holder,
        charge_id,
      });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async retrySale(provider_id) {
    try {
      const data = await this.#service.retryCharge(provider_id);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateOrder({ charge_id, approved }) {
    try {
      const data = await this.#service.updateOrder({ charge_id, approved });
      return data;
    } catch (error) {
      throw error;
    }
  }
  async cancelCharge(charge_id) {
    try {
      const data = await this.#service.cancelCharge(charge_id);
      return data;
    } catch (error) {
      throw error;
    }
  }
};
