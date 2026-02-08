/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('sales_items', 'discount_amount', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_items', 'discount_percentage', {
        type: Sequelize.DECIMAL(10, 2),
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn('sales_items', 'discount_amount'),
      queryInterface.removeColumn('sales_items', 'discount_percentage'),
    ]);
  },
};
