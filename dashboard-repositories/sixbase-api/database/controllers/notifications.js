const Notifications = require('../models/Notifications');

const createNotification = async (notificationObj) => {
  const notification = await Notifications.create(notificationObj);
  return notification;
};

const updateNotification = async (data, where) => {
  const notification = await Notifications.update(data, where);
  return notification;
};

const findAllNotificationsPaginated = async (where, page, size) => {
  page = Number(page);
  size = Number(size);
  const offset = page * size;
  const limit = size;
  const notifications = await Notifications.findAndCountAll({
    where,
    limit,
    offset,
    raw: true,
  });
  return notifications;
};

const markNotificationAsRead = async (id) => {
  const notification = await Notifications.update(
    {
      read: true,
    },
    {
      where: {
        id,
      },
    },
  );
  return notification;
};

const findOneNotification = async (uuid) => {
  const notification = await Notifications.findOne({
    raw: true,
    where: {
      uuid,
    },
  });

  return notification;
};

const findAllNotifications = async (where) => {
  const notifications = await Notifications.findAll({
    where,
  });

  return notifications;
};

const findWhereNotification = async (where) => {
  const notification = await Notifications.findOne({
    raw: true,
    where,
  });

  return notification;
};

module.exports = {
  createNotification,
  findAllNotificationsPaginated,
  findOneNotification,
  markNotificationAsRead,
  findAllNotifications,
  findWhereNotification,
  updateNotification,
};
