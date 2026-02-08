const NotificationService = require('../../../services/NotificationService');

const { ONESIGNAL_SOUND } = process.env;

module.exports = class PushNotification {
  #title;

  #content;

  #external_id;

  #sound;

  #name;

  constructor({
    title,
    content,
    external_id,
    sound = ONESIGNAL_SOUND,
    name = '',
  }) {
    this.#title = title;
    this.#content = content;
    this.#external_id = external_id;
    this.#sound = sound;
    this.#name = name;
  }

  async send() {
    const response = await new NotificationService().push({
      title: this.#title,
      content: this.#content,
      include_external_user_ids: [this.#external_id],
      name: this.#name,
      sound: this.#sound,
    });
    return response;
  }
};
