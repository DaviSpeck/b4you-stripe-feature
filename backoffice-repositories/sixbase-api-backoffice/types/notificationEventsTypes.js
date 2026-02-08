'use strict';

const notificationEventTypes = [
    {
        key: 'first_signup',
        label: 'Primeiro cadastro',
        defaultTemplateKey: 'FIRST_SIGNUP',
    },
    {
        key: 'first_sale',
        label: 'Primeira venda',
        defaultTemplateKey: 'FIRST_SALE',
    },
    {
        key: 'birthday',
        label: 'Aniversário',
        defaultTemplateKey: 'BIRTHDAY',
    },
    {
        key: 'user_inactive_30_days',
        label: 'Usuário inativo há 30 dias',
        defaultTemplateKey: 'USER_INACTIVE_30_DAYS',
    },
];

const findNotificationEventByKey = (key) =>
    notificationEventTypes.find((e) => e.key === String(key)) || null;

module.exports = {
    notificationEventTypes,
    findNotificationEventByKey,
};