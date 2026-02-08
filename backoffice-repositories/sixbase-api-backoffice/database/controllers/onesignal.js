const OnesignalNotifications = require('../models/OnesignalNotifications');
const OnesignalNotificationSchedules = require('../models/OnesignalNotificationSchedules');
const OnesignalNotificationHistory = require('../models/OnesignalNotificationHistory');

/**
 * Cria uma nova notificação
 */
const createNotification = async (payload, t = null) => {
  const opts = t ? { transaction: t } : {};
  const notification = await OnesignalNotifications.create(payload, opts);
  return notification.toJSON();
};

/**
 * Busca notificação por ID (raw)
 */
const findNotificationById = async (id) =>
  OnesignalNotifications.findByPk(id, { raw: true });

/**
 * Lista todas as notificações, incluindo 
 * schedules → history
 */
async function findAllNotificationsWithDetails() {
  return OnesignalNotifications.findAll({
    raw: false,
    include: [
      {
        model: OnesignalNotificationSchedules,
        as: 'schedules',
        include: [
          {
            model: OnesignalNotificationHistory,
            as: 'history',
          }
        ]
      }
    ],
    order: [
      ['created_at', 'DESC'],
      [{ model: OnesignalNotificationSchedules, as: 'schedules' }, 'send_at', 'ASC']
    ],
  });
}

/**
 * Busca notificação com todos os detalhes (schedules, history)
 */
const findNotificationWithDetails = async (id_notification) => {
  return OnesignalNotifications.findByPk(id_notification, {
    raw: false,
    include: [
      {
        model: OnesignalNotificationSchedules,
        as: 'schedules',
        include: [
          {
            model: OnesignalNotificationHistory,
            as: 'history',
          },
        ],
      },
    ],
  });
};

/**
 * Cria um agendamento
 */
const createSchedule = async (payload, t = null) => {
  const opts = t ? { transaction: t } : {};
  const schedule = await OnesignalNotificationSchedules.create(payload, opts);
  return schedule.toJSON();
};

/**
 * Busca agendamentos de uma notificação
 */
const findSchedulesByNotification = async (id_notification) =>
  OnesignalNotificationSchedules.findAll({ raw: true, where: { id_onesignal_notification: id_notification } });

/**
 * Cria um registro de histórico
 */
const createHistoryEntry = async (payload, t = null) => {
  const opts = t ? { transaction: t } : {};
  const entry = await OnesignalNotificationHistory.create(payload, opts);
  return entry.toJSON();
};

/**
 * Encontra o history pelo schedule e notificationId
 */
const findHistoryByScheduleAndNotificationId = async (
  scheduleId,
  notificationId,
  playerId = null,
) => {
  const historyInstance = await OnesignalNotificationHistory.findOne({
    where: {
      id_onesignal_notification_schedule: scheduleId,
      onesignal_notification_id: notificationId,
    },
  });
  if (!historyInstance) return null;
  const history = historyInstance.toJSON();

  return history;
};

/**
 * Retorna schedules cujo onesignal_schedule_id bate com o ID remoto
 */
async function findSchedulesByOneSignalId(oneSignalScheduleId) {
  return OnesignalNotificationSchedules.findAll({
    where: { onesignal_schedule_id: oneSignalScheduleId }
  });
}

/**
 * Verifica se já existe history para dado schedule+notificationId
 */
async function findHistoryByScheduleAndNotification(schedulePk, oneSignalNotificationId) {
  return OnesignalNotificationHistory.findOne({
    where: {
      id_onesignal_notification_schedule: schedulePk,
      onesignal_notification_id: oneSignalNotificationId,
    }
  });
}

module.exports = {
  createNotification,
  findNotificationById,
  findAllNotificationsWithDetails,
  findNotificationWithDetails,
  createSchedule,
  findSchedulesByNotification,
  createHistoryEntry,
  findHistoryByScheduleAndNotificationId,
  findSchedulesByOneSignalId,
  findHistoryByScheduleAndNotification
};