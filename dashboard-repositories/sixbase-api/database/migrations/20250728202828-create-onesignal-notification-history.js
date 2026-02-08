

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('onesignal_notification_history', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      id_onesignal_notification_schedule: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'onesignal_notification_schedules', key: 'id' },
        onDelete: 'CASCADE',
      },
      sent_at: Sequelize.DATE,
      status: Sequelize.STRING,
      onesignal_notification_id: Sequelize.STRING,
      recipients: Sequelize.INTEGER,
      response_data: Sequelize.JSON,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
      deleted_at: Sequelize.DATE,
    }),

  down: async (queryInterface) => queryInterface.dropTable('onesignal_notification_history'),
};
