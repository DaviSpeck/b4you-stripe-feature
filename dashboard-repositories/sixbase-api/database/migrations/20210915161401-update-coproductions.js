module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('coproduction_invites', 'allow_invoice', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('coproduction_invites', 'allow_invoice'),
    ]);
  },
};
