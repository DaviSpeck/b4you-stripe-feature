module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('withdrawals_settings', 'fee_variable', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.renameColumn('withdrawals_settings', 'fee', 'fee_fixed'),
      queryInterface.addColumn('withdrawals_settings_default', 'fee_variable', {
        type: Sequelize.DECIMAL(14, 2),
        defaultValue: 0,
        allowNull: false,
      }),
      queryInterface.renameColumn(
        'withdrawals_settings_default',
        'fee',
        'fee_fixed',
      ),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('withdrawals_settings', 'fee_variable'),
      queryInterface.renameColumn('withdrawals_settings', 'fee_fixed', 'fee'),
      queryInterface.removeColumn(
        'withdrawals_settings_default',
        'fee_variable',
      ),
      queryInterface.renameColumn(
        'withdrawals_settings_default',
        'fee_fixed',
        'fee',
      ),
    ]);
  },
};
