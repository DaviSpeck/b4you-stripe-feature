module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('withdrawals_settings_default', 'use_highest_sale', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
      queryInterface.addColumn('withdrawals_settings', 'use_highest_sale', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('withdrawals_settings', 'use_highest_sale'),
      queryInterface.removeColumn('withdrawals_settings', 'use_highest_sale'),
    ]);
  },
};
