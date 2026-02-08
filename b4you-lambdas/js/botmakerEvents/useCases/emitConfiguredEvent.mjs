export async function emitConfiguredEvent({
    eventKey,
    payload,
    botmakerEvents,
    models,
}) {
    const config = await models.NotificationEvents.findOne({
        where: {
            event_key: eventKey,
            is_active: true,
            trigger_type: 2, // EventBridge
        },
        raw: true,
    });

    if (!config) {
        return { skipped: true, reason: "event disabled or not found", eventKey };
    }

    payload.__templateKey = config.template_key;

    if (config.delay_seconds && config.delay_seconds > 0) {
        await new Promise((r) => setTimeout(r, config.delay_seconds * 1000));
    }

    return botmakerEvents.emit(eventKey, payload);
}