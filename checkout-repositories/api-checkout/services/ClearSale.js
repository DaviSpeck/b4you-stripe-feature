// https://api.clearsale.com.br/docs/realtimedecision
const logger = require('../utils/logger');
const HTTPClient = require('./HTTPClient');
const dateHelper = require('../utils/helpers/date');
const { capitalizeName } = require('../utils/formatters');
const Cache = require('../config/Cache');

const CLEAR_SALE_URL = 'https://api.clearsale.com.br/v1/'
const CLEAR_SALE_NAME = 'B4You'
const CLEAR_SALE_PASSWORD = '2uPJCf3YUq'

function formatNumber(phone_number) {
  if (typeof phone_number === 'string' && phone_number.length >= 10) {
    const ddd = phone_number.substring(0, 2);
    const number = phone_number.substring(2);
    return {
      ddd,
      number,
    };
  }

  return phone_number;
}

class ClearSale {
  #service;

  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.#service = new HTTPClient({ baseURL: `${CLEAR_SALE_URL}` });
  }

  async getToken() {
    console.log(CLEAR_SALE_URL,CLEAR_SALE_NAME,CLEAR_SALE_PASSWORD)
    try {
      const cachedOffer = await Cache.get(
        `${process.env.ENVIRONMENT}_token_clearsale`,
      );
      const data = JSON.parse(cachedOffer);
      if (data?.ExpirationDate > dateHelper().now) {
        return data.Token;
      }
      const body = {
        name: CLEAR_SALE_NAME,
        password: CLEAR_SALE_PASSWORD,
      };
      console.log('body', body);
      const response = await this.#service.post(`/authenticate`, body, {
        headers: this.headers,
      });
      console.log('response authenticate', response);
      const diffInMinutes = dateHelper(response.data.ExpirationDate).diff(
        dateHelper().now(),
        'minutes',
      );
      await Cache.set(
        `${process.env.ENVIRONMENT}_token_clearsale`,
        JSON.stringify(response.data),
        diffInMinutes,
      );
      return response;
    } catch (error) {
      logger.error(error);
      return error;
    }
  }

  async postOrder({
    order: {
      uuid,
      session_id,
      installments = 1,
      total_amount_order,
      total_amount_items,
    },
    customer: { email, ip, origin, document_number, full_name, phone_number },
    card: { card_number, expiration_date, card_holder },
    items,
    shipping,
  }) {
    try {
      const cachedOffer = await Cache.get(
        `${process.env.ENVIRONMENT}_token_clearsale`,
      );
      const data = JSON.parse(cachedOffer);
      console.log('token data', data);
      this.headers.Authorization = `Bearer ${data.Token}`;
      const body = {
        code: uuid,
        sessionID: session_id,
        date: dateHelper().now(),
        email,
        b2bB2c: 'B2C',
        itemValue: total_amount_items,
        totalValue: total_amount_order,
        numberOfInstallments: installments,
        ip,
        status: 0, // novo pedido para clear sale,
        origin,
        product: 1,
        billing: {
          type: 1,
          primaryDocument: document_number.replace(/[^\d]/g, ''),
          name: capitalizeName(full_name),
          email,
        },
        shipping: {
          type: 1,
          primaryDocument: document_number.replace(/[^\d]/g, ''),
          name: capitalizeName(full_name),
          email,
        },
        payments: [
          {
            sequential: 1,
            date: dateHelper().now(),
            value: total_amount_order,
            type: 1,
            installments,
            card: {
              bin: card_number.slice(0, 6),
              end: card_number.slice(-4),
              validityDate: expiration_date,
              ownerName: capitalizeName(card_holder),
            },
          },
        ],
        items: items.map(({ name, code, amount, qtd }) => ({
          code,
          name,
          value: amount,
          amount: qtd,
        })),
      };
      if (phone_number) {
        body.billing.phones = [
          {
            type: 1,
            ddi: 55,
            ddd: phone_number
              ? parseInt(formatNumber(phone_number).ddd, 10)
              : '',
            number: phone_number
              ? parseInt(formatNumber(phone_number).number, 10)
              : '',
          },
        ];
      }

      if (shipping && shipping.street) {
        body.shipping.address = {
          street: shipping.street,
          number: shipping.number,
          county: shipping.neighbourhood,
          city: shipping.city,
          state: shipping.state,
          zipcode: shipping.zipcode,
          country: 'Brasil',
          additionalInformation: shipping.complement,
        };
      }
      const response = await this.#service.post(`orders `, body, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      console.log(error);
      logger.error(JSON.stringify(error, null, 4));
      return error;
    }
  }
}
module.exports = ClearSale;
