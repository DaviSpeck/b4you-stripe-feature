module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('order_bumps', 'price_before', {
        type: Sequelize.DECIMAL(20, 2),
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('order_bumps', 'price_before'),
    ]);
  },
};
