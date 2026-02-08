const dateHelper = require('../../utils/helpers/date');
const { findNotificationType } = require('../../types/notificationsTypes');

const serializeSingleNotification = (notification) => {
  const {
    uuid,
    content,
    created_at,
    key,
    params,
    read_at,
    read,
    title,
    type,
    variant,
  } = notification;
  return {
    uuid,
    type: findNotificationType(type),
    title,
    content,
    key,
    variant,
    params,
    read,
    created_at,
    read_at: dateHelper(read_at).isValid() ? read_at : null,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleNotification);
    }
    return serializeSingleNotification(this.data);
  }
};
