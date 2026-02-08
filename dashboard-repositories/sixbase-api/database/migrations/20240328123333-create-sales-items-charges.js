/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sales_items_charges', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_sale_item: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_charge: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sales_items_charges');
  },
};
