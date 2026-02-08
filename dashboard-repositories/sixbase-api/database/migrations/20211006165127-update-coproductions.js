module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('coproductions', 'split_invoice', {
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.removeColumn('coproduction_invites', 'allow_invoice'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('coproductions', 'split_invoice'),
      queryInterface.addColumn('coproduction_invites', 'allow_invoice', {
        type: Sequelize.BOOLEAN,
      }),
    ]);
  },
};
