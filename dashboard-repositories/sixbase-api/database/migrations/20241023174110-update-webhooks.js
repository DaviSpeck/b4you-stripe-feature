/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('webhooks', 'id_type', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('webhooks', 'id_type');
  },
};
