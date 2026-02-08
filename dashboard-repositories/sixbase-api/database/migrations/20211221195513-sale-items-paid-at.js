module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales_items', 'paid_at', {
        type: Sequelize.DATE,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('sales_items', 'paid_at')]);
  },
};
