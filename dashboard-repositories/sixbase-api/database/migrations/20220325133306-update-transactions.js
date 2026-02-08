module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('transactions', 'id_invoice', {
        type: Sequelize.BIGINT,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('transactions', 'id_invoice'),
    ]);
  },
};
