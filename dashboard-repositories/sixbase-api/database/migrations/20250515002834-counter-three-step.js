/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product_offer', 'counter_three_steps', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('product_offer', 'counter_three_steps');
  },
};
