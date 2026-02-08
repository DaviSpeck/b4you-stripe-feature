module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.renameTable('payouts', 'withdrawals'),
      queryInterface.addColumn('withdrawals', 'uuid', {
        type: Sequelize.UUID,
        unique: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.renameTable('withdrawals', 'payouts'),
      queryInterface.removeColumn('withdrawals', 'uuid'),
    ]);
  },
};
