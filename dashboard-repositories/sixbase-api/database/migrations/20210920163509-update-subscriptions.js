module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('subscriptions', 'id_plan', {
        type: Sequelize.BIGINT,
        allowNull: false,
      }),
      queryInterface.removeColumn('subscriptions', 'price'),
      queryInterface.removeColumn('subscriptions', 'payment_frequency'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('subscriptions', 'id_plan'),
      queryInterface.addColumn('subscriptions', 'price', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      }),
      queryInterface.addColumn('subscriptions', 'payment_frequency', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
    ]);
  },
};
