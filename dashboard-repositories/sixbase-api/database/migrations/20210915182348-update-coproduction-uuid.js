module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('coproductions', 'uuid', {
        type: Sequelize.UUID,
        unique: true,
      }),
      queryInterface.addColumn('coproduction_invites', 'uuid', {
        type: Sequelize.UUID,
        unique: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all(
      [queryInterface.removeColumn('coproductions', 'uuid')],
      [queryInterface.removeColumn('coproduction_invite', 'uuid')],
    );
  },
};
