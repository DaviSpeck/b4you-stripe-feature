module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('sales_settings', 'installments_fee', {
        type: Sequelize.JSON,
      }),
      queryInterface.addColumn('sales_settings_default', 'installments_fee', {
        type: Sequelize.JSON,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('sales_settings', 'installments_fee'),
      queryInterface.removeColumn('sales_settings_default', 'installments_fee'),
    ]);
  },
};
