module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales_items', 'quantity', {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('sales_items', 'quantity')]);
  },
};
