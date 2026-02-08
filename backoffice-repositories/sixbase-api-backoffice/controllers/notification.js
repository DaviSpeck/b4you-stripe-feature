const { sequelize } = require('../database/models');
const ScheduleModel = require('../database/models/OnesignalNotificationSchedules');
const NotificationsModel = require('../database/models/OnesignalNotifications');
const {
    createNotification,
    createSchedule,
    createHistoryEntry,
    createDelivery,
    findHistoryByScheduleAndNotificationId,
    findNotificationWithDetails,
    findAllNotificationsWithDetails
} = require('../database/controllers/onesignal');
const { sendNotification } = require('../services/OneSignalService');
const logger = require('../utils/logger');
const DateHelper = require('../utils/helpers/date');
const UsersRepository = require('../repositories/sequelize/UsersRepository');

/**
 * DELETE /api/notifications/:id
 * Apaga a notificação — as FK em cascade cuidam do resto
 */
module.exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params

        const deletedCount = await NotificationsModel.destroy({
            where: { id }
        })

        if (!deletedCount) {
            return res.status(404).json({ error: 'Notificação não encontrada' })
        }

        return res.status(204).send()
    } catch (err) {
        logger.error('[NotificationController][delete] Error:', err)
        return next(err)
    }
}

/**
 * GET /api/notifications
 * Retorna todas as notificações + detalhes
 */
module.exports.list = async (req, res, next) => {
    try {
        const notifications = await findAllNotificationsWithDetails();
        return res.json({ notifications });
    } catch (err) {
        console.error('[NotificationController][list] Error:', err);
        return next(err);
    }
}

/**
 * POST /api/notifications/resolve-emails
 * Converte uma lista de e-mails em UUIDs de usuários cadastrados.
 */
module.exports.resolveEmailsToUUIDs = async (req, res, next) => {
    try {
        const { emails } = req.body;

        if (!Array.isArray(emails) || !emails.length) {
            return res.status(400).json({ error: "É preciso enviar ao menos um email válido" });
        }

        const userUUIDs = [];
        for (const email of emails) {
            const user = await UsersRepository.findByEmail(email);
            if (user?.uuid) {
                userUUIDs.push(user.uuid);
            }
        }

        return res.status(200).json({
            message: "UUIDs encontrados",
            uuids: userUUIDs,
        });
    } catch (err) {
        console.error(">>> ERRO em resolveEmailsToUUIDs:", err);
        next(err);
    }
};

/**
 * POST /api/notifications/test-push-notification
 * Envia uma notificação de teste para usuários específicos.
 */
module.exports.testNotification = async (req, res, next) => {
    try {
        const { title, content, url, image_url, platforms, audience, schedule } = req.body;

        let sendDate;
        if (schedule?.type === "scheduled") {
            sendDate = new Date(schedule.send_at);
        } else if (schedule?.type === "relative") {
            sendDate = new Date(Date.now() + schedule.offset_in_minutes * 60000);
        } else {
            sendDate = new Date();
        }

        const basePayload = {
            headings: { en: title, pt: title },
            contents: { en: content, pt: content },
            send_after: sendDate,
            ...(url ? { url } : {}),
            ...(image_url
                ? {
                    chrome_web_image: image_url, // web push
                    big_picture: image_url, // android
                    ios_attachments: { id1: image_url } // iOS
                }
                : {}),
        };

        const { tags, subscription_ids, external_user_ids } = audience || {};

        if (subscription_ids?.length) {
            basePayload.include_player_ids = subscription_ids;
        } else if (external_user_ids?.length) {
            basePayload.include_external_user_ids = external_user_ids;
        } else if (tags?.length) {
            const filters = [];
            tags.forEach((tagKey, i) => {
                const value = tagKey === "user_status" ? "inactive" : "active";
                filters.push({ field: "tag", key: tagKey, relation: "=", value });
                if (i < tags.length - 1) filters.push({ operator: "OR" });
            });
            basePayload.filters = filters;
        }

        const results = [];
        for (const platform of platforms || []) {
            let platformPayload = { ...basePayload };
            platformPayload.channel_for_external_user_ids = "push";
            const oneSignalRes = await sendNotification(platformPayload, platform);
            results.push({ platform, oneSignalRes });
        }

        return res.status(200).json({
            message: "Notificação de teste enviada",
            success: results.length,
            errors: results
                .filter(r => r.oneSignalRes?.errors)
                .map(r => r.oneSignalRes.errors)
                .flat()
        });
    } catch (err) {
        console.error(">>> ERRO em testNotification:", err);
        next(err);
    }
};

/**
 * POST /api/notifications
 * Cria uma notificação real e agenda seu envio para web/mobile.
 */
module.exports.create = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { title, content, url, image_url, platforms, audience, schedule } = req.body;

        const notification = await createNotification(
            { title, content, url, image_url, audience, id_user: req.user.id },
            t
        );

        let sendDate;
        if (schedule.type === "scheduled") {
            sendDate = new Date(schedule.send_at);
        } else if (schedule.type === "relative") {
            sendDate = new Date(Date.now() + schedule.offset_in_minutes * 60000);
        } else {
            sendDate = new Date();
        }

        const sendDateForDB = DateHelper(sendDate).utcOffset(-180);

        const baseScheduleData = {
            id_onesignal_notification: notification.id,
            schedule_type: schedule.type,
            send_at: sendDateForDB,
            offset_in_minutes: schedule.offset_in_minutes || null,
        };

        const basePayload = {
            headings: { en: title, pt: title },
            contents: { en: content, pt: content },
            send_after: sendDate,
            ...(url ? { url } : {}),
            ...(image_url
                ? {
                    chrome_web_image: image_url, // web push
                    big_picture: image_url, // android
                    ios_attachments: { id1: image_url } // iOS
                }
                : {}),
        };

        const { tags, subscription_ids, external_user_ids } = audience;

        if (subscription_ids?.length) {
            basePayload.include_player_ids = subscription_ids;
        } else if (external_user_ids?.length) {
            basePayload.include_external_user_ids = external_user_ids;
        } else if (tags?.length) {
            const filters = [];
            tags.forEach((tagKey, i) => {
                const value = tagKey === "user_status" ? "inactive" : "active";
                filters.push({ field: "tag", key: tagKey, relation: "=", value });
                if (i < tags.length - 1) filters.push({ operator: "OR" });
            });
            basePayload.filters = filters;
        }

        const schedules = [];
        for (const platform of platforms) {
            if (!["web", "mobile"].includes(platform)) {
                continue;
            }

            const oneSignalRes = await sendNotification(basePayload, platform);

            const newSchedule = await createSchedule(
                {
                    ...baseScheduleData,
                    platform,
                    onesignal_schedule_id: oneSignalRes.id,
                },
                t
            );

            schedules.push(newSchedule);
        }

        await t.commit();
        return res.status(201).json({ notification, schedules });
    } catch (err) {
        await t.rollback();
        logger.error("[NotificationController][create] Error:", err);
        return next(err);
    }
};

/**
 * Recupera notificação + detalhes (schedules, history)
 */
module.exports.getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await findNotificationWithDetails(id);

        if (!notification) {
            return res.status(404).json({ error: 'Notificação não encontrada' });
        }

        return res.json(notification);
    } catch (err) {
        logger.error('[NotificationController][getById] Error:', err);
        return next(err);
    }
};