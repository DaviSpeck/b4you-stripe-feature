module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('coproductions', 'accepted_at', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
      queryInterface.addColumn('coproductions', 'rejected_at', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('coproductions', 'accepted_at'),
      queryInterface.removeColumn('coproductions', 'rejected_at'),
    ]);
  },
};
