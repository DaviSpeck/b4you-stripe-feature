module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales_settings', 'fee_variable_billet', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn(
        'sales_settings_default',
        'fee_variable_billet',
        {
          type: Sequelize.DECIMAL(10, 2),
        },
      ),
      queryInterface.renameColumn(
        'sales_settings',
        'fee_billet',
        'fee_fixed_billet',
      ),
      queryInterface.renameColumn(
        'sales_settings_default',
        'fee_billet',
        'fee_fixed_billet',
      ),
      queryInterface.addColumn('psp_fees', 'fee_variable_billet', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('psp_fees', 'fee_fixed_billet', {
        type: Sequelize.DECIMAL(10, 2),
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('sales_settings', 'fee_variable_billet'),
      queryInterface.removeColumn(
        'sales_settings_default',
        'fee_variable_billet',
      ),
      queryInterface.renameColumn(
        'sales_settings',
        'fee_fixed_billet',
        'fee_billet',
      ),
      queryInterface.renameColumn(
        'sales_settings_default',
        'fee_fixed_billet',
        'fee_billet',
      ),
      queryInterface.removeColumn('psp_fees', 'fee_fixed_billet'),
      queryInterface.removeColumn('psp_fees', 'fee_variable_billet'),
    ]);
  },
};
