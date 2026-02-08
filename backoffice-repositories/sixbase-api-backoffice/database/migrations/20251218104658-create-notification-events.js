'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notification_events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },

      event_key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Identificador lógico do evento (ex: first_signup, birthday)',
      },

      title: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: 'Nome exibido no front',
      },

      template_key: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: 'Identificador do template/intent no Botmaker',
      },

      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      trigger_type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Tipo de gatilho (1 = SQS, 2 = EventBridge)',
      },

      delay_seconds: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Delay em segundos (apenas para eventos SQS)',
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex(
      'notification_events',
      ['event_key'],
      {
        unique: true,
        name: 'notification_events_event_key_uq',
      },
    );

    await queryInterface.addIndex(
      'notification_events',
      ['is_active'],
      {
        name: 'notification_events_is_active_idx',
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'notification_events',
      'notification_events_event_key_uq',
    );
    await queryInterface.removeIndex(
      'notification_events',
      'notification_events_is_active_idx',
    );
    await queryInterface.dropTable('notification_events');
  },
};