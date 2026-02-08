module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn(
        'sales_settings',
        'fee_variable_percentage_service',
        {
          type: Sequelize.DECIMAL(14, 2),
        },
      ),
      queryInterface.addColumn('sales_settings', 'fee_fixed_amount_service', {
        type: Sequelize.DECIMAL(14, 2),
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn(
        'sales_settings',
        'fee_variable_percentage_service',
      ),
      queryInterface.removeColumn('sales_settings', 'fee_fixed_amount_service'),
    ]);
  },
};
