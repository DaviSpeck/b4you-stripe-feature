module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('coproductions', 'expires_at', {
        type: Sequelize.DATEONLY,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('coproductions', 'expires_at', {
        type: Sequelize.DATE,
      }),
    ]);
  },
};
