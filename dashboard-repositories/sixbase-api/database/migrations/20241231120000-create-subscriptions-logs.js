/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscriptions_logs', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_subscription: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID da subscription relacionada',
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Ação realizada (payment_failed, email_sent, email_failed, subscription_canceled)',
      },
      details: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Detalhes adicionais da ação em formato JSON',
      },
      email_type: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Tipo de email (d1, d2, d3, d4, d5, d15, d30)',
      },
      email_sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data/hora quando o email foi enviado',
      },
      mailjet_message_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'ID da mensagem no Mailjet',
      },
      mailjet_message_uuid: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'UUID da mensagem no Mailjet',
      },
      mailjet_status: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Status do envio no Mailjet (success, failed)',
      },
      mailjet_response: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Resposta completa do Mailjet em formato JSON',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('subscriptions_logs', ['id_subscription']);
    await queryInterface.addIndex('subscriptions_logs', ['email_type']);
    await queryInterface.addIndex('subscriptions_logs', ['action']);
    await queryInterface.addIndex('subscriptions_logs', ['mailjet_message_id']);
    await queryInterface.addIndex('subscriptions_logs', ['mailjet_status']);
    await queryInterface.addIndex('subscriptions_logs', ['created_at']);

    await queryInterface.addConstraint('subscriptions_logs', {
      fields: ['id_subscription'],
      type: 'foreign key',
      name: 'fk_subscriptions_logs_subscription_id',
      references: {
        table: 'subscriptions',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('subscriptions_logs');
  },
};
