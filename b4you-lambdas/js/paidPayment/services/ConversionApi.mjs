import { HttpClient } from './HTTPClient.mjs';
import { splitFullName, SHA256 } from '../utils/formatters.mjs';

export default class ConversionApi {
  #service;

  constructor(pixel_id, token) {
    this.#service = new HttpClient({
      baseURL: `https://graph.facebook.com/v18.0`,
    });
    this.pixel_id = pixel_id;
    this.token = token;
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

    console.log(`[purchase] [body] -> ${JSON.stringify(body)}`);
    const response = await this.#service.post(
      `/${this.pixel_id}/events?access_token=${this.token}`,
      body
    );
    console.log(`[purchase] [response] -> ${JSON.stringify(response.data)}`);
    return response;
  }
}
