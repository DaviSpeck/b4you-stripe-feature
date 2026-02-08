module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('transactions', 'fee_percentage', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      }),
      queryInterface.addColumn('transactions', 'fee_amount', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('transactions', 'fee_percentage'),
      queryInterface.removeColumn('transactions', 'fee_amount'),
    ]);
  },
};
