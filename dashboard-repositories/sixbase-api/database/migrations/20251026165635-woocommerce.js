/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'sales_items_plugins',
      'id_order_woocommerce',
      {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'sales_items_plugins',
      'id_order_woocommerce',
    );
  },
};
