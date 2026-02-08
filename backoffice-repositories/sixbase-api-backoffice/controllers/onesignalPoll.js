const { fetchNotifications } = require('../services/OneSignalService');
const {
    findSchedulesByOneSignalId,
    findHistoryByScheduleAndNotification,
    createHistoryEntry,
} = require('../database/controllers/onesignal');
const logger = require('../utils/logger');

async function pollAndSaveHistory() {
    let offset;
    do {
        const { notifications, offset: nextOffset } = await fetchNotifications({ offset });
        for (const notif of notifications) {
            const schedules = await findSchedulesByOneSignalId(notif.id);
            if (!schedules.length) {
                logger.warn(`[Polling] schedule não encontrado para ID ${notif.id}`);
                continue;
            }
            const schedule = schedules[0];

            const existing = await findHistoryByScheduleAndNotification(schedule.id, notif.id);
            if (existing) continue;

            await createHistoryEntry({
                id_onesignal_notification_schedule: schedule.id,
                sent_at: new Date(notif.queued_at * 1000),
                queued_at: new Date(notif.queued_at * 1000),
                send_after: notif.send_after
                    ? new Date(notif.send_after * 1000)
                    : null,
                completed_at: notif.completed_at
                    ? new Date(notif.completed_at * 1000)
                    : null,
                status: notif.errored > 0 ? 'error' : 'sent',
                onesignal_notification_id: notif.id,
                recipients: notif.recipients,
                successful: notif.successful,
                failed: notif.failed,
                errored: notif.errored,
                remaining: notif.remaining,
                platform_delivery_stats: notif.platform_delivery_stats,
                response_data: notif,
            });
            logger.info(`[Polling] history salvo para schedule=${schedule.id}`);
        }
        offset = nextOffset;
    } while (offset);
}

module.exports = { pollAndSaveHistory };