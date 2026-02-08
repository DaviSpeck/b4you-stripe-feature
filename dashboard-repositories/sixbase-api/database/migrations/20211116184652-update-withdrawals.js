module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('withdrawals', 'id_invoice', {
        type: Sequelize.BIGINT,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('withdrawals', 'id_invoice'),
    ]);
  },
};
