const {
  createNotification,
} = require('../../../database/controllers/notifications');
const { findNotificationType } = require('../../../types/notificationsTypes');

module.exports = class {
  constructor({
    id_student = null,
    id_user = null,
    content,
    key,
    params,
    title,
    type = findNotificationType('Outros').id,
    variant,
  }) {
    this.id_user = id_user;
    this.id_student = id_student;
    this.content = content;
    this.key = key;
    this.params = params;
    this.title = title;
    this.type = type;
    this.variant = variant;
  }

  async execute() {
    const createdNotification = await createNotification({
      id_user: this.id_user,
      id_student: this.id_student,
      content: this.content,
      key: this.key,
      params: this.params,
      type: this.type,
      variant: this.variant,
      title: this.title,
    });
    return createdNotification;
  }
};
