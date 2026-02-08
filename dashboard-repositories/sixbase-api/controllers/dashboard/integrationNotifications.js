const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const {
  findAllIntegrationNotificationsPaginated,
  findOneIntegrationNotification,
  markIntegrationNotificationAsRead,
} = require('../../database/controllers/integration_notifications');
const Sales_items = require('../../database/models/Sales_items');
const Sales = require('../../database/models/Sales');
const SQS = require('../../queues/aws');

const getIntegrationNotificationsController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { page = 0, size = 20, id_type, id_action, read },
  } = req;

  try {
    const where = {
      id_user,
    };

    where.id_type = {
      [Op.ne]: 4,
    };

    if (id_type !== undefined) {
      where.id_type = id_type;
    }

    if (id_action !== undefined) {
      where.id_action = id_action;
    }

    if (read !== undefined) {
      where.read = read === 'true' || read === true;
    }

    const notifications = await findAllIntegrationNotificationsPaginated(
      where,
      page,
      size,
    );

    return res.status(200).send({
      success: true,
      data: notifications.rows,
      count: notifications.count,
      page: Number(page),
      size: Number(size),
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, GET: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const markIntegrationNotificationAsReadController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { id },
  } = req;

  try {
    const notification = await findOneIntegrationNotification(id);

    if (!notification) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Notificação não encontrada',
        }),
      );
    }

    if (notification.id_user !== id_user) {
      return next(ApiError.forbidden());
    }

    await markIntegrationNotificationAsRead(id);

    return res.status(200).send({
      success: true,
      message: 'Notificação marcada como lida',
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, PUT: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const blingReadController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { id },
  } = req;

  try {
    const notification = await findOneIntegrationNotification(id);

    if (!notification) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Notificação não encontrada',
        }),
      );
    }

    if (notification.id_user !== id_user) {
      return next(ApiError.forbidden());
    }

    const sale_item = await Sales_items.findAll({
      attributes: ['uuid'],
      where: {
        id_sale: notification.id_sale,
        type: 1,
      },
    });

    return res.status(200).send({
      success: true,
      sale_item,
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, PUT: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const updateDataController = async (req, res, next) => {
  const {
    user: { id: id_user },
    body: { whatsapp = null, address = null },
    params: { id },
  } = req;

  try {
    const notification = await findOneIntegrationNotification(id);
    if (!notification) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Notificação não encontrada',
        }),
      );
    }
    const sale = await Sales.findOne({
      where: {
        id: notification.id_sale,
        id_user,
      },
    });
    if (!sale) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Venda não encontrada',
        }),
      );
    }
    if (whatsapp) {
      console.log(
        'Atualizando whatsapp pelo painel de notificacoes',
        sale.id,
        whatsapp,
      );
      await Sales.update(
        { whatsapp },
        {
          where: {
            id: sale.id,
          },
        },
      );
    } else if (address && address.city) {
      console.log(
        'Atualizando cidade pelo painel de notificacoes',
        sale.id,
        address.city,
      );
      await Sales.update(
        {
          address: {
            ...sale.address,
            city: address.city,
          },
        },
        {
          where: { id: sale.id },
        },
      );
    }
    return res.sendStatus(200);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, PUT: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const resendBlingController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { id },
  } = req;

  try {
    const notification = await findOneIntegrationNotification(id);
    if (!notification) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Notificação não encontrada',
        }),
      );
    }
    const sale = await Sales.findOne({
      where: {
        id: notification.id_sale,
        id_user,
      },
    });
    if (!sale) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Venda não encontrada',
        }),
      );
    }
    const si = await Sales_items.findOne({
      attributes: [],
      where: {
        id_sale: sale.id,
        type: 1,
      },
      include: [
        {
          association: 'product',
          attributes: ['payment_type'],
        },
      ],
    });

    await SQS.add('blingShipping', {
      sale_id: sale.id,
      is_subscription: si.product.payment_type === 'subscription',
    });
    return res.sendStatus(200);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, PUT: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports = {
  getIntegrationNotificationsController,
  markIntegrationNotificationAsReadController,
  blingReadController,
  updateDataController,
  resendBlingController,
};
