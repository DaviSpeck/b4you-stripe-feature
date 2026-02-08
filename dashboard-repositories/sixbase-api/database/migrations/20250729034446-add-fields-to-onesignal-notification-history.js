

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('onesignal_notification_history', 'queued_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('onesignal_notification_history', 'send_after', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('onesignal_notification_history', 'completed_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('onesignal_notification_history', 'successful', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('onesignal_notification_history', 'failed', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('onesignal_notification_history', 'errored', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('onesignal_notification_history', 'remaining', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('onesignal_notification_history', 'platform_delivery_stats', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('onesignal_notification_history', 'queued_at');
    await queryInterface.removeColumn('onesignal_notification_history', 'send_after');
    await queryInterface.removeColumn('onesignal_notification_history', 'completed_at');
    await queryInterface.removeColumn('onesignal_notification_history', 'successful');
    await queryInterface.removeColumn('onesignal_notification_history', 'failed');
    await queryInterface.removeColumn('onesignal_notification_history', 'errored');
    await queryInterface.removeColumn('onesignal_notification_history', 'remaining');
    await queryInterface.removeColumn('onesignal_notification_history', 'platform_delivery_stats');
  }
};
