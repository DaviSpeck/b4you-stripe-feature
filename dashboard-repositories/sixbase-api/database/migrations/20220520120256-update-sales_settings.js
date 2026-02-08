module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('sales_settings', 'fee_interest_card'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales_settings', 'fee_interest_card', {
        type: Sequelize.JSON,
        allowNull: false,
      }),
    ]);
  },
};
