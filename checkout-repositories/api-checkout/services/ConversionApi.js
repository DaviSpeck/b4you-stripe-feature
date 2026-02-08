const HttpClient = require('./HTTPClient');
const { SHA256 } = require('../utils/formatters');
const ApiError = require('../error/ApiError');
const logger = require('../utils/logger');
const { splitFullName } = require('../utils/formatters');

module.exports = class ConversionApi {
  #service;

  constructor(pixel_id, token, owner_email = null) {
    this.#service = new HttpClient({
      baseURL: `https://graph.facebook.com/v18.0`,
    });
    this.pixel_id = pixel_id;
    this.token = token;
    this.owner = owner_email;
  }

  async initiateCheckout({
    client_ip_address,
    client_user_agent,
    fbp,
    event_id,
    personal_data,
  }) {
    const body = {
      data: [
        {
          event_name: 'InitiateCheckout',
          event_time: Math.floor(Date.now() / 1000),
          event_id,
          action_source: 'website',
          user_data: {
            client_ip_address,
            client_user_agent,
            fbp,
          },
        },
      ],
      // test_event_code: 'TEST68903',
    };

    if (personal_data && personal_data.email) {
      body.data[0].user_data.em = SHA256(personal_data.email);
    }
    if (personal_data && personal_data.whatsapp) {
      body.data[0].user_data.ph = SHA256(personal_data.whatsapp);
    }
    if (personal_data && personal_data.full_name) {
      body.data[0].user_data.fn = SHA256(
        splitFullName(personal_data.full_name).firstName,
      );
      body.data[0].user_data.ln = SHA256(
        splitFullName(personal_data.full_name).lastName,
      );
    }

    logger.info(
      `[initiateCheckout] [owner -> ${this.owner}] [body] -> ${JSON.stringify(
        body,
      )}`,
    );

    const response = await this.#service.post(
      `/${this.pixel_id}/events?access_token=${this.token}`,
      body,
    );
    logger.info(
      `[InitiateCheckout] [owner -> ${
        this.owner
      }] [response] -> ${JSON.stringify(response.data)}`,
    );
    return response;
  }

  async purchase({
    personal_data,
    client_ip_address,
    client_user_agent,
    fbp,
    event_id,
    custom_data,
  }) {
    const body = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_id,
          user_data: {
            em: SHA256(personal_data.email),
            ph: SHA256(personal_data.whatsapp),
            fn: SHA256(splitFullName(personal_data.full_name).firstName),
            ln: SHA256(splitFullName(personal_data.full_name).lastName),
            client_ip_address,
            client_user_agent,
            fbp,
          },
          custom_data: {
            currency: 'BRL',
            value: custom_data.value,
            content_ids: custom_data.content_ids,
            content_type: 'product',
          },
        },
      ],
      // test_event_code: 'TEST68903',
    };

    logger.info(
      `[purchase] [owner -> ${this.owner}] [SALE ID: ${
        custom_data.sale_id
      }] [body] -> ${JSON.stringify(body)}`,
    );
    try {
      const response = await this.#service.post(
        `/${this.pixel_id}/events?access_token=${this.token}`,
        body,
      );
      logger.info(
        `[purchase] [owner -> ${this.owner}] [response] -> ${JSON.stringify(
          response.data,
        )}`,
      );
      return response;
    } catch (error) {
      logger.info(
        `ERROR ON PIXEL EVENT FACEBOOK [EVENT PURCHASE] -> PIXEL ID: ${
          this.pixel_id
        }  [owner -> ${this.owner}] -> ERROR -> ${JSON.stringify(error)}`,
      );
      return false;
    }
  }

  async addPaymentInfo({
    personal_data,
    client_ip_address,
    client_user_agent,
    fbp,
    event_id,
    custom_data,
  }) {
    const body = {
      data: [
        {
          event_name: 'AddPaymentInfo',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_id,
          user_data: {
            em: SHA256(personal_data.email),
            ph: SHA256(personal_data.whatsapp),
            fn: SHA256(splitFullName(personal_data.full_name).firstName),
            ln: SHA256(splitFullName(personal_data.full_name).lastName),
            client_ip_address,
            client_user_agent,
            fbp,
          },
          custom_data: {
            currency: 'BRL',
            value: custom_data.value,
            content_ids: custom_data.content_ids,
            content_type: 'product',
          },
        },
      ],
      // test_event_code: 'TEST68903',
    };
    logger.info(
      `[AddPaymentInfo] [owner -> ${this.owner}] [body] -> ${JSON.stringify(
        body,
      )}`,
    );
    const response = await this.#service.post(
      `/${this.pixel_id}/events?access_token=${this.token}`,
      body,
    );
    logger.info(
      `[AddPaymentInfo] [owner -> ${this.owner}] [response] -> ${JSON.stringify(
        response.data,
      )}`,
    );

    return response;
  }

  async boleto({
    personal_data,
    client_ip_address,
    client_user_agent,
    fbp,
    event_id,
    custom_data,
  }) {
    const body = {
      data: [
        {
          event_name: 'BoletoGerado',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_id,
          user_data: {
            em: SHA256(personal_data.email),
            ph: SHA256(personal_data.whatsapp),
            fn: SHA256(splitFullName(personal_data.full_name).firstName),
            ln: SHA256(splitFullName(personal_data.full_name).lastName),
            client_ip_address,
            client_user_agent,
            fbp,
          },
          custom_data: {
            currency: 'BRL',
            value: custom_data.value,
            content_ids: custom_data.content_ids,
            content_type: 'product',
          },
        },
      ],
      // test_event_code: 'TEST68903',
    };

    logger.info(
      `[Boleto] [owner -> ${this.owner}] [body] -> ${JSON.stringify(body)}`,
    );
    const response = await this.#service.post(
      `/${this.pixel_id}/events?access_token=${this.token}`,
      body,
    );
    logger.info(
      `[Boleto] [owner -> ${this.owner}] [response] -> ${JSON.stringify(
        response.data,
      )}`,
    );
    return response;
  }

  async send({
    event_name,
    email,
    phone,
    first_name,
    last_name,
    client_ip_address,
    client_user_agent,
    fbp,
    event_id,
    custom_data,
    test_event_code,
  }) {
    if (event_name === 'InitiateCheckout')
      return this.initiateCheckout({
        fbp,
        client_ip_address,
        client_user_agent,
        event_id,
        test_event_code,
      });

    if (event_name === 'AddPaymentInfo')
      return this.addPaymentInfo({
        email,
        phone,
        first_name,
        last_name,
        fbp,
        client_ip_address,
        client_user_agent,
        event_id,
        custom_data,
        test_event_code,
      });

    if (event_name === 'Purchase')
      return this.purchase({
        email,
        phone,
        first_name,
        last_name,
        fbp,
        client_ip_address,
        client_user_agent,
        custom_data,
        event_id,
        test_event_code,
      });

    if (event_name === 'Boleto')
      return this.boleto({
        email,
        phone,
        first_name,
        last_name,
        fbp,
        client_ip_address,
        client_user_agent,
        custom_data,
        event_id,
        test_event_code,
      });

    throw ApiError.badRequest('event_name not supported');
  }
};
