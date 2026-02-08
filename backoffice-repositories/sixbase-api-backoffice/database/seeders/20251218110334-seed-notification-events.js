'use strict';

const {
  notificationEventTypes,
} = require('../../types/notificationEventsTypes');

const {
  findTriggerTypeByKey,
} = require('../../types/notificationTriggerTypes');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const sqsTrigger = findTriggerTypeByKey('sqs');
    const eventBridgeTrigger = findTriggerTypeByKey('event_bridge');

    const rows = [
      {
        event_key: 'first_signup',
        title: 'Primeiro cadastro',
        template_key: 'FIRST_SIGNUP',
        description: 'Disparado quando o usuário realiza o primeiro cadastro',
        is_active: true,
        trigger_type: sqsTrigger.id,
        delay_seconds: 0,
        created_at: now,
        updated_at: now,
      },
      {
        event_key: 'first_sale',
        title: 'Primeira venda',
        template_key: 'FIRST_SALE',
        description: 'Disparado quando o usuário realiza a primeira venda',
        is_active: true,
        trigger_type: sqsTrigger.id,
        delay_seconds: 0,
        created_at: now,
        updated_at: now,
      },
      {
        event_key: 'birthday',
        title: 'Aniversário',
        template_key: 'BIRTHDAY',
        description: 'Disparado no dia do aniversário do usuário',
        is_active: true,
        trigger_type: eventBridgeTrigger.id,
        delay_seconds: null,
        created_at: now,
        updated_at: now,
      },
      {
        event_key: 'user_inactive_30_days',
        title: 'Usuário inativo há 30 dias',
        template_key: 'USER_INACTIVE_30_DAYS',
        description: 'Disparado quando o usuário fica 30 dias sem atividade',
        is_active: true,
        trigger_type: eventBridgeTrigger.id,
        delay_seconds: null,
        created_at: now,
        updated_at: now,
      },
    ];

    // evita duplicar registros se o seed rodar novamente
    const existing = await queryInterface.sequelize.query(
      'SELECT event_key FROM notification_events',
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const existingKeys = new Set(existing.map((e) => e.event_key));

    const toInsert = rows.filter(
      (row) => !existingKeys.has(row.event_key),
    );

    if (toInsert.length) {
      await queryInterface.bulkInsert(
        'notification_events',
        toInsert,
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'notification_events',
      {
        event_key: [
          'first_signup',
          'first_sale',
          'birthday',
          'user_inactive_30_days',
        ],
      },
    );
  },
};