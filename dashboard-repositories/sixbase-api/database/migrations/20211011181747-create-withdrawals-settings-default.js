module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('withdrawals_settings_default', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      free_month_withdrawal: {
        type: Sequelize.INTEGER,
      },
      max_daily_withdrawal: {
        type: Sequelize.INTEGER,
      },
      max_amount: {
        type: Sequelize.DECIMAL(10, 2),
      },
      min_amount: {
        type: Sequelize.DECIMAL(10, 2),
      },
      fee: {
        type: Sequelize.DECIMAL(10, 2),
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    }),

  down: async (queryInterface) =>
    queryInterface.dropTable('withdrawals_settings_default'),
};
