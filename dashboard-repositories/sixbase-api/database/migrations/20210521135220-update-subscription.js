module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('subscriptions', 'next_charge', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      }),
      queryInterface.addColumn('subscriptions', 'payment_frequency', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      await queryInterface.removeColumn('subscriptions', 'next_charge'),
      await queryInterface.removeColumn('subscriptions', 'payment_frequency'),
    ]);
  },
};
