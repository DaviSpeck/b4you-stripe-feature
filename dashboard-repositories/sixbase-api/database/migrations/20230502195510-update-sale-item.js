module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales_items', 'tracking_code', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('sales_items', 'tracking_url', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('sales_items', 'tracking_code'),
      queryInterface.removeColumn('sales_items', 'tracking_url'),
    ]);
  },
};
