module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('sales_items', 'id_invoice'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales_items', 'id_invoice', {
        type: Sequelize.BIGINT,
        allowNull: false,
      }),
    ]);
  },
};
