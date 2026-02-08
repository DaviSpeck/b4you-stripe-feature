

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('onesignal_notification_schedules', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      id_onesignal_notification: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'onesignal_notifications', key: 'id' },
        onDelete: 'CASCADE',
      },
      schedule_type: { type: Sequelize.STRING, allowNull: false },
      send_at: Sequelize.DATE,
      offset_in_minutes: Sequelize.INTEGER,
      onesignal_schedule_id: Sequelize.STRING,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
      deleted_at: Sequelize.DATE,
    }),

  down: async (queryInterface) => queryInterface.dropTable('onesignal_notification_schedules'),
};
