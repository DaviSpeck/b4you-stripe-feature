module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales_items', 'uuid', {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDv4,
      }),
      queryInterface.changeColumn('sales_items', 'id_product', {
        type: Sequelize.BIGINT,
        allowNull: false,
      }),
      queryInterface.changeColumn('sales_items', 'price', {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('sales_items', 'uuid');
  },
};
