const splitFullName = (name) => ({
  firstName: name.split(' ')[0],
  lastName: name.substring(name.split(' ')[0].length).trim(),
});

export class PaymentService {
  #service;

  constructor(service) {
    this.#service = service;
  }

  async generateCardSale(
    { transaction_id, price, installments = 1, products, commissions, statement_descriptor },
    { provider_external_id, ip_client = null },
    { card_number, cardholder_name, security_code, expiration_month, expiration_year },
    address = {}
  ) {
    try {
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
    address,
    ip,
  }) {
    try {
      const data = await this.#service.createPix({
        customer: {
          provider_external_id,
          address,
          ip,
        },
        items: products,
        amount,
        external_id: transaction_id,
        splits: commissions,
      });
      return data;
    } catch (error) {
      console.log(error.response.data.errors);
      throw error;
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

  async createClient({ full_name, document_number, email, whatsapp, ip = null }) {
    const { firstName: first_name, lastName: last_name } = splitFullName(full_name);
    const data = await this.#service.createClient({
      first_name,
      last_name,
      document_number,
      email,
      whatsapp,
      ip,
    });
    return data;
  }

  async createCardToken({ provider_external_id, card_number, card_holder, expiration_date, cvv }) {
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
}
