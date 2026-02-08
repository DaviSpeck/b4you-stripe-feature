module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('subscriptions', 'attempt_count', {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        allowNull: true,
      }),
      queryInterface.addColumn('subscriptions', 'next_attempt', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('subscriptions', 'attempt_count'),
      queryInterface.removeColumn('subscriptions', 'next_attempt'),
    ]);
  },
};
