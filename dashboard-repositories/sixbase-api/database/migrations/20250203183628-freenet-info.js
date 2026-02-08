/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'sales_items',
      'integration_shipping_company',
      {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'sales_items',
      'integration_shipping_company',
    );
  },
};
