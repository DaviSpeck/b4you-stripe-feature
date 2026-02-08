'use strict';

const notificationTriggerTypes = [
    { id: 1, key: 'sqs', label: 'SQS' },
    { id: 2, key: 'event_bridge', label: 'EventBridge' },
];

const findTriggerTypeById = (id) =>
    notificationTriggerTypes.find((t) => t.id === Number(id)) || null;

const findTriggerTypeByKey = (key) =>
    notificationTriggerTypes.find((t) => t.key === String(key)) || null;

module.exports = {
    notificationTriggerTypes,
    findTriggerTypeById,
    findTriggerTypeByKey,
};