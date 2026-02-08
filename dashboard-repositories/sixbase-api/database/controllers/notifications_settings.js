const Notifications_settings = require('../models/Notifications_settings');

const createNotificationsSettings = async (id_user, t = null) => {
  const notficationsSettings = await Notifications_settings.create(
    { id_user },
    t
      ? {
          transaction: t,
        }
      : null,
  );
  return notficationsSettings;
};

const updateNotificationsSettings = async (where, data) =>
  Notifications_settings.update(data, { where });

const findNotificationsSettings = async (id_user) =>
  Notifications_settings.findOne({ where: { id_user } });

const findOrCreateNotificationsSettings = async (id_user) =>
  Notifications_settings.findOne({
    where: { id_user },
    include: [{ association: 'user' }],
  }).then((settings) => {
    if (settings) return settings;
    return Notifications_settings.create({ id_user });
  });

module.exports = {
  createNotificationsSettings,
  updateNotificationsSettings,
  findNotificationsSettings,
  findOrCreateNotificationsSettings,
};
