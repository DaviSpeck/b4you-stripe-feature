/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('plugins', 'is_supplier', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('plugins', 'is_supplier');
  },
};
