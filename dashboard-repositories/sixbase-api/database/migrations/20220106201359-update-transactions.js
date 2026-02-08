module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn(
        'transactions',
        'fee_variable_percentage_service',
        {
          type: Sequelize.DECIMAL(14, 2),
        },
      ),
      queryInterface.addColumn('transactions', 'fee_fixed_amount_service', {
        type: Sequelize.DECIMAL(14, 2),
      }),
      queryInterface.addColumn('transactions', 'fee_variable_amount_service', {
        type: Sequelize.DECIMAL(14, 2),
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn(
        'transactions',
        'fee_variable_percentage_service',
      ),
      queryInterface.removeColumn('transactions', 'fee_fixed_amount_service'),
      queryInterface.removeColumn(
        'transactions',
        'fee_variable_amount_service',
      ),
    ]);
  },
};
