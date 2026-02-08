module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('subscriptions', 'valid_until', {
        type: Sequelize.DATEONLY,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('subscriptions', 'valid_until', {
        type: Sequelize.DATE,
      }),
    ]);
  },
};
