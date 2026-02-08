module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn(
        'withdrawals_settings',
        'withheld_balance_percentage',
        {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 10,
          allowNull: false,
        },
      ),
      queryInterface.addColumn(
        'withdrawals_settings_default',
        'withheld_balance_percentage',
        {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 10,
          allowNull: false,
        },
      ),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn(
        'withdrawals_settings',
        'withheld_balance_percentage',
      ),
      queryInterface.removeColumn(
        'withdrawals_settings_default',
        'withheld_balance_percentage',
      ),
    ]);
  },
};
