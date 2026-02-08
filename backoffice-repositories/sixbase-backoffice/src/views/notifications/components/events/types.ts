export interface NotificationTrigger {
    id: number
    key: 'sqs' | 'event_bridge'
    label: string
}

export interface NotificationEvent {
    id: number
    event_key: string
    title: string
    template_key: string
    description?: string | null
    is_active: boolean
    trigger_type: number
    delay_seconds?: number | null
    created_at: string
    updated_at: string

    // enriquecido pelo backend (List/Get)
    trigger?: NotificationTrigger | null
}