module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('product_plans', 'subscription_fee', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn('product_plans', 'subscription_fee_price', {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0,
      }),
      queryInterface.addColumn('product_plans', 'charge_first', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('product_plans', 'subscription_fee'),
      queryInterface.removeColumn('product_plans', 'subscription_fee_price'),
      queryInterface.removeColumn('product_plans', 'charge_first'),
    ]);
  },
};
