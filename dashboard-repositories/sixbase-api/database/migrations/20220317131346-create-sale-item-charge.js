module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sales_items_transactions', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_transaction: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_sale_item: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sales_items_transactions');
  },
};
