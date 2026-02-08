const presentNotificationEvent =
    require('../../utils/notification-event-presenter');

module.exports = class ListNotificationEvents {
    constructor(repository) {
        this.repository = repository;
    }

    async execute() {
        const rows = await this.repository.findAll();
        return rows.map(presentNotificationEvent);
    }
};