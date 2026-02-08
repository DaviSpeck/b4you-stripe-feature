const ApiError = require('../../error/ApiError');

const {
  findOneNotification,
  findAllNotifications,
} = require('../../database/controllers/notifications');

const validateNotification = async (req, res, next) => {
  const { notification_id } = req.params;
  try {
    const notification = await findOneNotification(notification_id);
    if (!notification)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Notificação não encontrada',
        }),
      );

    req.notification = notification;
    return next();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const findNotifications = async (req, res, next) => {
  const {
    student: { id: id_student },
  } = req;
  try {
    const notifications = await findAllNotifications({
      id_student,
      read: false,
    });

    if (!notifications)
      return res
        .status(200)
        .send({ success: true, message: 'Notificações atualizadas' });

    req.notifications = notifications;
    return next();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const findUserNotifications = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const notifications = await findAllNotifications({
      id_user,
      read: false,
    });
    if (!notifications)
      return res
        .status(200)
        .send({ success: true, message: 'Notificações atualizadas' });
    req.notifications = notifications;
    return next();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports = {
  validateNotification,
  findNotifications,
  findUserNotifications,
};
