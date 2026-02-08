import api from '../providers/api';

/**
 * Sincroniza o playerId no backend
 * @param {string} playerId
 * @param {string} device_id
 * @returns {Promise<void>}
 */
export async function syncPlayerId(playerId, device_id) {
  await api.patch('/onesignal/sync', { playerId, device_id });
}

/**
 * Busca notificações paginadas
 * @param {number} page
 * @param {number} pageSize
 * @returns {Promise<{ notifications: Array, total: number }>}
 */
export async function fetchNotifications(page = 1, pageSize = 5) {
  const { data } = await api.get('/onesignal/notifications', {
    params: { page, pageSize },
  });
  return {
    notifications: data.notifications ?? [],
    total: data.total ?? 0,
    integrations: data.notifyIntegrations ?? [],
  };
}

/**
 * Marca uma notificação de integração como lida
 * @param {number} id - ID da notificação de integração
 * @returns {Promise<void>}
 */
export async function markIntegrationAsRead(id) {
  await api.put(`/onesignal/notify-integrations/${id}/read`);
}
