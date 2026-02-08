const presentNotificationEvent =
    require('../../utils/notification-event-presenter');

module.exports = class GetNotificationEvent {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(id) {
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

        return presentNotificationEvent(event);
    }
};