const date = require('../../utils/helpers/date');
const HTTPClient = require('../HTTPClient');

const { KONDUTO_URL, KONDUTO_API_KEY_DIGITAL, KONDUTO_API_KEY_PHYSICAL } =
  process.env;

class Konduto {
  #service;

  constructor(provider) {
    let envPassword = null;
    if (provider === 'DIGITAL') {
      envPassword = KONDUTO_API_KEY_DIGITAL;
    }

    if (provider === 'PHYSICAL') {
      envPassword = KONDUTO_API_KEY_PHYSICAL;
    }
    this.headers = {
      Authorization: `Basic ${Buffer.from(envPassword).toString('base64')}`,
      'Content-Type': 'application/json',
    };
    this.#service = new HTTPClient({
      baseURL: `${KONDUTO_URL}`,
    });
  }

  async createOrder({
    created_at,
    customer: { email, document_number, full_name, phone },
    payments,
    address,
    uuid_sale,
    provider_id,
    fingerprint,
    total_amount,
    shipping_amount,
    installments,
    ip,
    shopping_cart,
    seller,
  }) {
    const paymentsArray = Array.isArray(payments) ? payments : [];

    const body = {
      id: provider_id,
      visitor: fingerprint.slice(0, 39),
      total_amount,
      shipping_amount,
      currency: 'BRL',
      installments,
      ip,
      sales_channel: uuid_sale,
      purchased_at: date(created_at).utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      shopping_cart,
      payment: paymentsArray.map((payment) => ({
        type: 'credit',
        status: 'pending',
        bin: payment.number.replace(/\s+/g, '').slice(0, 10),
        last4: payment.number.replace(/\s+/g, '').slice(-4),
        amount: payment.amount || total_amount,
        expiration_date: payment.expiration_date,
        tax_id: document_number,
        holder: payment.card_holder,
      })),
      customer: {
        id: fingerprint.slice(0, 99),
        name: full_name,
        email,
        tax_id: document_number,
        document_type: 'cpf',
        phone1: phone,
        created_at: date(created_at).utc().format('YYYY-MM-DD'),
      },
      seller,
    };
    if (address.street) {
      const { street, city, state, zipcode, house_number } = address;
      body.billing = {
        name: full_name,
        address1: `${street}, ${house_number}`,
        city,
        state,
        zip: zipcode,
        country: 'BR',
      };
    }
    // eslint-disable-next-line no-console
    console.log('BODY KONDUTO->', body);
    try {
      const { data } = await this.#service.post('/orders', body, {
        headers: this.headers,
      });
      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error on konduto', error.response.data);
      return error;
    }
  }
}

module.exports = Konduto;
