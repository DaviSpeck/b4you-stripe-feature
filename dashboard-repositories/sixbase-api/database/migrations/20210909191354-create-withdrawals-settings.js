module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('withdrawals_settings', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      free_month_withdrawal: {
        type: Sequelize.INTEGER,
        defaultValue: 4,
      },
      max_daily_withdrawal: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      max_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 2000,
      },
      min_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 5,
      },
      fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 3,
      },
      blocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) =>
    queryInterface.dropTable('withdrawals_settings'),
};
