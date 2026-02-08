module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('transactions', 'subscription_fee', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
      }),
      queryInterface.addColumn('transactions', 'split_price', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('transactions', 'subscription_fee'),
      queryInterface.removeColumn('transactions', 'split_price'),
    ]);
  },
};
