const { literal } = require('sequelize');
const Users = require('../../database/models/Users');
const {
  updateUserTagsByOnesignalId,
  updateUserContact,
} = require('../../services/OneSignalService');
const CheckAffiliateUC = require('../../useCases/dashboard/affiliates/CheckAffiliateHasRecentConfirmedCommissionUseCase');
const CheckProducerUC = require('../../useCases/dashboard/producers/CheckProducerHasRecentConfirmedCommissionUseCase');
const {
  syncUserTags,
} = require('../../useCases/dashboard/users/SyncUserTagsUseCase');
const ApiError = require('../../error/ApiError');
const OnesignalUserTags = require('../../database/models/OnesignalUserTags');
const OnesignalNotifications = require('../../database/models/OnesignalNotifications');
const IntegrationNotifications = require('../../database/models/IntegrationNotifications');
const {
  findIntegrationNotificationTypeByKey,
} = require('../../types/integrationNotificationTypes');

module.exports.listUserNotifications = async (req, res, next) => {
  try {
    const id_user = req.user?.id;
    if (!id_user) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.max(1, parseInt(req.query.pageSize, 10) || 5);
    const offset = (page - 1) * pageSize;

    const tags = await OnesignalUserTags.findAll({
      where: { id_user },
      attributes: ['tag_key', 'tag_value'],
    });

    if (tags.length === 0) {
      return res.json({ notifications: [], total: 0 });
    }

    const effectiveTags = [];

    tags.forEach((t) => {
      if (t.tag_key === 'user_status' && t.tag_value === 'inactive') {
        effectiveTags.push('user_status');
      }
      if (t.tag_key === 'producer_status' && t.tag_value === 'active') {
        effectiveTags.push('producer_status');
      }
      if (t.tag_key === 'affiliate_status' && t.tag_value === 'active') {
        effectiveTags.push('affiliate_status');
      }
    });

    if (effectiveTags.length === 0) {
      return res.json({ notifications: [], total: 0 });
    }

    const tagJsonArray = JSON.stringify(effectiveTags);

    const overlapCondition = literal(
      `JSON_OVERLAPS(audience->'$.tags', CAST('${tagJsonArray}' AS JSON))`,
    );

    const { rows, count } = await OnesignalNotifications.findAndCountAll({
      where: overlapCondition,
      order: [['created_at', 'DESC']],
      limit: pageSize,
      offset,
    });

    const notifyIntegrations = await IntegrationNotifications.findAndCountAll({
      limit: pageSize,
      order: [['created_at', 'DESC']],
      offset,
      attributes: ['id', 'created_at', 'id_sale', 'params'],
      where: {
        read: false,
        id_user,
        id_type: findIntegrationNotificationTypeByKey('refund').id,
      },
      include: [
        {
          association: 'sale',
          attributes: ['email', 'full_name', 'created_at'],
        },
        {
          association: 'sale_item',
          attributes: ['uuid'],
        },
      ],
    });

    return res.json({
      notifications: rows,
      total: count + notifyIntegrations.count,
      notifyIntegrations: notifyIntegrations.rows,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
    return next(
      ApiError.internalServerError(
        `Erro interno em ${req.method} ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.sync = async (req, res, next) => {
  try {
    const {
      user: { id: id_user },
      body: { playerId, device_id },
    } = req;

    if (!id_user)
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    if (!playerId)
      return res
        .status(400)
        .json({ error: 'PlayerId Onesignal é obrigatório' });

    const user = await Users.findByPk(id_user, {
      attributes: ['id', 'onesignal_player_id'],
    });

    if (user && user.onesignal_player_id !== playerId) {
      await user.update({ onesignal_player_id: playerId });
    }

    if (!device_id) {
      const { email } = req.user;
      const raw = (req.user.whatsapp || '').replace(/\D/g, '');
      let sms = null;
      if (raw) {
        const normalized = raw.startsWith('55') ? raw : `55${raw}`;
        sms = `+${normalized}`;
      }

      await updateUserContact(playerId, { email, sms_number: sms });
    }

    const [isAffiliate, isProducer] = await Promise.all([
      new CheckAffiliateUC().execute({ affiliateId: id_user, days: 90 }),
      new CheckProducerUC().execute({ producerId: id_user, days: 90 }),
    ]);

    const tags = {
      affiliate_status: isAffiliate ? 'active' : '',
      producer_status: isProducer ? 'active' : '',
      user_status: !isAffiliate && !isProducer ? 'inactive' : '',
    };

    await syncUserTags(user.id, tags);

    let resultWeb;
    let resultApp;

    if (device_id) {
      resultApp = await updateUserTagsByOnesignalId(playerId, tags, 'app');
    } else {
      resultWeb = await updateUserTagsByOnesignalId(playerId, tags, 'web');
    }

    return res.json({
      db: {
        id_user,
        onesignal_player_id: playerId,
        isAffiliate,
        isProducer,
      },
      onesignalWeb: resultWeb,
      onesignalApp: resultApp,
    });
  } catch (error) {
    console.dir(error, { depth: null });
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

module.exports.setRead = async (req, res, next) => {
  const { id } = req.params;
  try {
    await IntegrationNotifications.update(
      { read: 1 },
      {
        where: {
          id,
        },
      },
    );
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
    return next(
      ApiError.internalServerError(
        `Erro interno em ${req.method} ${req.originalUrl}`,
        error,
      ),
    );
  }
};
