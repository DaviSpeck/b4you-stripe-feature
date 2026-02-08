module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn(
        'sales_settings_default',
        'fee_interest_card',
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales_settings_default', 'fee_interest_card', {
        type: Sequelize.JSON,
        allowNull: false,
      }),
    ]);
  },
};
