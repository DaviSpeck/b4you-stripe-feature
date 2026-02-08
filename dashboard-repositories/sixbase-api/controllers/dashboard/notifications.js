const ApiError = require('../../error/ApiError');
const SerializeNotification = require('../../presentation/membership/notifications');
const {
  findAllNotificationsPaginated,
  markNotificationAsRead,
  findOneNotification,
} = require('../../database/controllers/notifications');

const findAllNotificationsController = async (req, res, next) => {
  const { page = 0, size = 10 } = req.query;
  const {
    user: { id: id_user },
  } = req;
  try {
    const notifications = await findAllNotificationsPaginated(
      { id_user },
      page,
      size,
    );
    return res.status(200).send({
      count: notifications.count,
      rows: new SerializeNotification(notifications.rows).adapt(),
    });
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

const findAndMarkAsReadController = async (req, res, next) => {
  const { notification } = req;
  try {
    await markNotificationAsRead(notification.id);
    const updatedNotification = await findOneNotification(notification.id);
    return res
      .status(200)
      .send(new SerializeNotification(updatedNotification).adapt());
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

const markAllAsReadController = async (req, res, next) => {
  const { notifications } = req;
  try {
    const promises = [];
    notifications.forEach(({ id }) => {
      const update = markNotificationAsRead(id);
      promises.push(update);
    });
    await Promise.all(promises);
    return res
      .status(200)
      .send({ success: true, message: 'Notificações atualizadas' });
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
  findAllNotificationsController,
  findAndMarkAsReadController,
  markAllAsReadController,
};
