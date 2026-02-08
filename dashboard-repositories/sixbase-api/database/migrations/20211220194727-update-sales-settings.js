module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales_settings', 'fee_variable_pix', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('sales_settings_default', 'fee_variable_pix', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.renameColumn(
        'sales_settings',
        'fee_credit_card',
        'fee_fixed_card',
      ),
      queryInterface.renameColumn(
        'sales_settings',
        'installments_fee',
        'fee_variable_card',
      ),
      queryInterface.renameColumn(
        'sales_settings_default',
        'fee_credit_card',
        'fee_fixed_card',
      ),
      queryInterface.renameColumn(
        'sales_settings_default',
        'installments_fee',
        'fee_variable_card',
      ),
      queryInterface.renameColumn('sales_settings', 'fee_pix', 'fee_fixed_pix'),
      queryInterface.renameColumn(
        'sales_settings_default',
        'fee_pix',
        'fee_fixed_pix',
      ),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('sales_settings_default', 'fee_fixed_pix'),
      queryInterface.removeColumn('sales_settings_default', 'fee_variable_pix'),
      queryInterface.renameColumn(
        'sales_settings',
        'fee_fixed_card',
        'fee_credit_card',
      ),
      queryInterface.renameColumn(
        'sales_settings',
        'fee_variable_card',
        'installments_fee',
      ),
      queryInterface.renameColumn(
        'sales_settings_default',
        'fee_fixed_card',
        'fee_credit_card',
      ),
      queryInterface.renameColumn(
        'sales_settings_default',
        'fee_variable_card',
        'installments_fee',
      ),
      queryInterface.renameColumn('sales_settings', 'fee_fixed_pix', 'fee_pix'),
      queryInterface.renameColumn(
        'sales_settings_default',
        'fee_fixed_pix',
        'fee_pix',
      ),
    ]);
  },
};
