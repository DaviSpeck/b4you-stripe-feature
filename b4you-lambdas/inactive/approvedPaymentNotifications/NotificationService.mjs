import { HttpClient } from './HTTPClient.mjs';

const { API_ONESIGNAL, ONESIGNAL_APPID, ONESIGNAL_AUTHORIZATION } = process.env;

export class NotificationService {
  #service;

  #headers;

  constructor() {
    this.#service = new HttpClient({
      baseURL: API_ONESIGNAL,
    });

    this.#headers = {
      Authorization: `basic ${ONESIGNAL_AUTHORIZATION}`,
    };
  }

  async push({ name, title, content, include_external_user_ids, sound }) {
    try {
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
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log('erro ao enviar notificação push', error);
    }
  }
}
