

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('onesignal_notification_deliveries', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      id_onesignal_notification_history: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'onesignal_notification_history', key: 'id' },
        onDelete: 'CASCADE',
      },
      id_user: { type: Sequelize.BIGINT, allowNull: true },
      one_signal_player_id: { type: Sequelize.STRING, allowNull: false },
      delivered_at: Sequelize.DATE,
      read_at: Sequelize.DATE,
      delivery_status: { type: Sequelize.STRING, defaultValue: 'delivered' },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
      deleted_at: Sequelize.DATE,
    }),

  down: async (queryInterface) => queryInterface.dropTable('onesignal_notification_deliveries'),
};
