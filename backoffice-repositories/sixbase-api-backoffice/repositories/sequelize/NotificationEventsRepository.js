const NotificationEvents =
    require('../../database/models/Notification_events');

module.exports = class NotificationEventsRepository {
    /**
     * Lista todos os eventos de notificação
     */
    static async findAll() {
        const rows = await NotificationEvents.findAll({
            order: [['id', 'ASC']],
        });

        return rows.map((r) => r.toJSON());
    }

    /**
     * Busca evento por ID
     * @param {number} id
     */
    static async findById(id) {
        const row = await NotificationEvents.findByPk(id);
        return row ? row.toJSON() : null;
    }

    /**
     * Busca evento pelo event_key (uso no Lambda)
     * @param {string} eventKey
     */
    static async findByEventKey(eventKey) {
        const row = await NotificationEvents.findOne({
            where: { event_key: eventKey },
        });

        return row ? row.toJSON() : null;
    }

    /**
     * Atualiza evento por ID
     * @param {number} id
     * @param {object} data
     */
    static async updateById(id, data) {
        await NotificationEvents.update(data, {
            where: { id },
        });
    }
};