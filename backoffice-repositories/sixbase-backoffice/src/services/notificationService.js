import { api } from './api'

/**
 * Busca notificações já criadas
 */
export const fetchNotifications = () =>
    api.get('/notifications')
        .then(res => res.data)

/**
 * Busca uma notificação por ID
 */
export const fetchNotificationById = (id) =>
    api.get(`/notifications/${id}`)
        .then(res => res.data)

/**
 * Cria uma notificação com múltiplos agendamentos
 * 
 * payload = {
 *   title,
 *   content,
 *   audience: { segment?, subscription_ids?, external_user_ids? },
 *   schedules: [
 *     { type, send_at?, offset_in_minutes? },
 *     …
 *   ]
 * }
 */
export const createNotification = (payload) =>
    api.post('/notifications/send-push-notification', payload)
        .then(res => res.data)

/**
 * Deleta uma notificação (e todo o agendamento/ histórico em cascade)
 */
export const deleteNotification = (id) =>
    api.delete(`/notifications/${id}`)
        .then(() => id)
