import { NotificationEvent } from 'views/notifications/components/events/types'
import { api } from './api'

/**
 * Lista todos os eventos automáticos
 */
export const fetchNotificationEvents = async (): Promise<NotificationEvent[]> => {
    const { data } = await api.get('/notifications/events')
    return data
}

/**
 * Busca um evento específico pelo ID
 * Usado no formulário de configuração
 */
export const getNotificationEventById = async (
    id: number
): Promise<NotificationEvent> => {
    const { data } = await api.get(`/notifications/events/${id}`)
    return data
}

/**
 * Atualiza configuração do evento
 */
export const updateNotificationEvent = async (
    id: number,
    payload: {
        is_active?: boolean
        template_key?: string
        description?: string | null
        delay_seconds?: number | null
    }
): Promise<void> => {
    await api.patch(`/notifications/events/${id}`, payload)
}