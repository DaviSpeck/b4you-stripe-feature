/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'notifications_settings',
      'mail_approved_payment',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: 1,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'notifications_settings',
      'mail_approved_payment',
    );
  },
};
