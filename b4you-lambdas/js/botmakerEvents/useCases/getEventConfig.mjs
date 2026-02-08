export async function getEventConfig(models, eventKey) {
    return models.NotificationEvents.findOne({
        where: {
            event_key: eventKey,
            is_active: true,
        },
        raw: true,
    });
}