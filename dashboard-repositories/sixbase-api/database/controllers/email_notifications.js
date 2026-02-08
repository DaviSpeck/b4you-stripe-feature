const Email_notifications = require('../models/Email_notifications');
const Students = require('../models/Students');
const Users = require('../models/Users');

const findAllEmailNotificationsPaginated = async (where, page, size) => {
  const limit = parseInt(size, 10);
  const offset = limit * parseInt(page, 10);
  const notifications = await Email_notifications.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: Users,
        as: 'producer',
      },
      {
        model: Students,
        as: 'student',
      },
    ],
  });
  return notifications;
};

const createEmailNotifications = async (data) =>
  Email_notifications.create(data);

const updateEmailNotifications = async (where, data) =>
  Email_notifications.update(data, { where });

module.exports = {
  createEmailNotifications,
  findAllEmailNotificationsPaginated,
  updateEmailNotifications,
};
