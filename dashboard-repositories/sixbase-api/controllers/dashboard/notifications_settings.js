const ApiError = require('../../error/ApiError');

const {
  findOrCreateNotificationsSettings,
  updateNotificationsSettings,
} = require('../../database/controllers/notifications_settings');

module.exports.getUserInfo = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const notificationsSettings = await findOrCreateNotificationsSettings(
      id_user,
    );
    return res.status(200).send(notificationsSettings);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

module.exports.updateUserInfo = async (req, res, next) => {
  const {
    user: { id: id_user },
    body,
  } = req;
  try {
    await updateNotificationsSettings({ id_user }, body);
    return res
      .status(200)
      .send({ success: true, message: 'Notificações alteradas com sucesso' });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};
