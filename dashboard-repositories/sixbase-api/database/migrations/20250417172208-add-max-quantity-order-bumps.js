/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('order_bumps', 'max_quantity', {
      type: Sequelize.INTEGER,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('order_bumps', 'max_quantity');
  },
};
