const HTTPClient = require('./HTTPClient');

const {
  API_ONESIGNAL,
  ONESIGNAL_AUTHORIZATION,
  ONESIGNAL_APPID,
  ONESIGNAL_SMS_FROM,
} = process.env;

module.exports = class NotificationService {
  #service;

  #headers;

  constructor() {
    this.#service = new HTTPClient({
      baseURL: API_ONESIGNAL,
    });

    this.#headers = {
      Authorization: `basic ${ONESIGNAL_AUTHORIZATION}`,
    };
  }

  async push({ name, title, content, include_external_user_ids, sound }) {
    const response = await this.#service.post(
      '/notifications',
      {
        app_id: ONESIGNAL_APPID,
        name,
        contents: {
          en: content,
        },
        headings: {
          en: title,
        },
        include_external_user_ids,
        ios_badgeType: 'Increase',
        ios_badgeCount: 1,
        ios_sound: sound,
        android_sound: sound,
      },
      {
        headers: this.#headers,
      },
    );

    return response.data;
  }

  async sms({ name, content, phone_numbers }) {
    const response = await this.#service.post(
      '/notifications',
      {
        app_id: ONESIGNAL_APPID,
        name,
        sms_from: ONESIGNAL_SMS_FROM,
        contents: {
          en: content,
        },
        include_phone_numbers: phone_numbers,
      },
      this.#headers,
    );

    return response.data;
  }
};
