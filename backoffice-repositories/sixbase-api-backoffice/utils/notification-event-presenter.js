const { findTriggerTypeById } = require('../types/notificationTriggerTypes');

module.exports = function presentNotificationEvent(event) {
    const trigger = findTriggerTypeById(event.trigger_type);

    return {
        ...event,
        trigger: trigger
            ? {
                id: trigger.id,
                key: trigger.key,
                label: trigger.label,
            }
            : null,
    };
};