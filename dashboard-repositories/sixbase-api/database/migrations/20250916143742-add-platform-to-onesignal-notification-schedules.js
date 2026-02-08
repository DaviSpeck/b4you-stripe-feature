/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'onesignal_notification_schedules',
      'platform',
      {
        type: Sequelize.ENUM('web', 'mobile'),
        allowNull: false,
        defaultValue: 'web'
      }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('onesignal_notification_schedules', 'platform');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_onesignal_notification_schedules_platform";'
    );
  },
};
