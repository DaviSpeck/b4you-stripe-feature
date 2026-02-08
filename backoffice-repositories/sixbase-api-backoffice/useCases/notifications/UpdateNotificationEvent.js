const presentNotificationEvent =
    require('../../utils/notification-event-presenter');
const { findTriggerTypeById } =
    require('../../types/notificationTriggerTypes');

module.exports = class UpdateNotificationEvent {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(id, payload) {
        if (!id || Number.isNaN(id)) {
            const err = new Error('ID inválido');
            err.status = 400;
            throw err;
        }

        const event = await this.repository.findById(id);
        if (!event) {
            const err = new Error('Evento de notificação não encontrado');
            err.status = 404;
            throw err;
        }

        const trigger = findTriggerTypeById(event.trigger_type);
        if (!trigger) {
            const err = new Error('Tipo de gatilho inválido');
            err.status = 422;
            throw err;
        }

        const {
            is_active,
            template_key,
            description,
            delay_seconds,
        } = payload;

        if (
            trigger.key === 'event_bridge' &&
            typeof delay_seconds === 'number'
        ) {
            const err = new Error(
                'Eventos disparados por EventBridge não suportam delay',
            );
            err.status = 422;
            throw err;
        }

        if (
            trigger.key === 'sqs' &&
            typeof delay_seconds === 'number' &&
            delay_seconds < 0
        ) {
            const err = new Error('Delay deve ser maior ou igual a zero');
            err.status = 422;
            throw err;
        }

        const updatePayload = {};

        if (typeof is_active === 'boolean') {
            updatePayload.is_active = is_active;
        }

        if (typeof template_key === 'string') {
            updatePayload.template_key = template_key;
        }

        if (typeof description === 'string' || description === null) {
            updatePayload.description = description;
        }

        if (trigger.key === 'sqs') {
            if (delay_seconds !== undefined) {
                updatePayload.delay_seconds = delay_seconds;
            }
        } else {
            updatePayload.delay_seconds = null;
        }

        if (Object.keys(updatePayload).length === 0) {
            const err = new Error('Nenhum campo válido para atualização');
            err.status = 422;
            throw err;
        }

        await this.repository.updateById(id, updatePayload);

        const updated = await this.repository.findById(id);
        return presentNotificationEvent(updated);
    }
};