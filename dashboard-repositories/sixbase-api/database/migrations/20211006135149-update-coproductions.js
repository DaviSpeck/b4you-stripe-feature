module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('coproductions', 'id_invite', {
        type: Sequelize.BIGINT,
        allowNull: false,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('coproductions', 'id_invite'),
    ]);
  },
};
