import { useEffect, useState } from 'react'
import NotificationEventForm from './NotificationEventForm'
import NotificationEventRow from './NotificationEventRow'
import { NotificationEvent } from './types'
import { fetchNotificationEvents, updateNotificationEvent } from 'services/notification-events.service'

export default function NotificationEventsList() {
    const [events, setEvents] = useState<NotificationEvent[]>([])
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)

    const load = async () => {
        try {
            setLoading(true)
            const res = await fetchNotificationEvents()
            setEvents(Array.isArray(res) ? res : [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleToggleActive = async (id: number, active: boolean) => {
        await updateNotificationEvent(id, { is_active: active })
        load()
    }

    return (
        <div className="p-2">
            <p className="text-muted mb-2">
                Configure os eventos automáticos disparados pelo sistema.
            </p>

            {loading && (
                <div className="text-muted small mb-2">
                    Carregando eventos…
                </div>
            )}

            {!loading && events.length === 0 && (
                <div className="text-muted small mb-2">
                    Nenhum evento automático configurado.
                </div>
            )}

            {events.map((evt) => (
                <NotificationEventRow
                    key={evt.id}
                    event={evt}
                    onToggleActive={handleToggleActive}
                    onConfigure={(id) => setSelectedId(id)}
                />
            ))}

            {selectedId && (
                <NotificationEventForm
                    eventId={selectedId}
                    onClose={() => setSelectedId(null)}
                    onSaved={() => {
                        setSelectedId(null)
                        load()
                    }}
                />
            )}
        </div>
    )
}
