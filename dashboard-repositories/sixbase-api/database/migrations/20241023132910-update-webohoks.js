/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('webhooks_logs', 'id_event', {
      type: Sequelize.INTEGER,
      defaultValue: null,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('webhooks_logs', 'id_event');
  },
};
