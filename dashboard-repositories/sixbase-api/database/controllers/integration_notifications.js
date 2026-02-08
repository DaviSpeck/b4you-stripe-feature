const IntegrationNotifications = require('../models/IntegrationNotifications');

const createIntegrationNotification = async (notificationObj) => {
  const notification = await IntegrationNotifications.create(notificationObj);
  return notification;
};

const findAllIntegrationNotificationsPaginated = async (where, page, size) => {
  page = Number(page);
  size = Number(size);
  const offset = page * size;
  const limit = size;
  const notifications = await IntegrationNotifications.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [
      {
        association: 'sale',
        attributes: ['full_name', 'whatsapp', 'email', 'address'],
      },
    ],
  });
  return notifications;
};

const findAllIntegrationNotifications = async (where) => {
  const notifications = await IntegrationNotifications.findAll({
    where,
    order: [['created_at', 'DESC']],
    raw: true,
  });
  return notifications;
};

const findOneIntegrationNotification = async (id) => {
  const notification = await IntegrationNotifications.findOne({
    raw: true,
    where: {
      id,
    },
  });
  return notification;
};

const markIntegrationNotificationAsRead = async (id) => {
  const notification = await IntegrationNotifications.update(
    {
      read: true,
      read_at: new Date(),
    },
    {
      where: {
        id,
      },
    },
  );
  return notification;
};

module.exports = {
  createIntegrationNotification,
  findAllIntegrationNotificationsPaginated,
  findAllIntegrationNotifications,
  findOneIntegrationNotification,
  markIntegrationNotificationAsRead,
};
