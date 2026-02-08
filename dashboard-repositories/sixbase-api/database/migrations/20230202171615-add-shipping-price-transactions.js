module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('transactions', 'shipping_price', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('transactions', 'shipping_price'),
    ]);
  },
};
