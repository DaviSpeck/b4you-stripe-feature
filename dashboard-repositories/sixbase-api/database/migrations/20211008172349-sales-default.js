module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('sales_settings_default', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      fee_billet: {
        type: Sequelize.DECIMAL(10, 2),
      },
      fee_credit_card: {
        type: Sequelize.DECIMAL(10, 2),
      },
      fee_pix: {
        type: Sequelize.DECIMAL(10, 2),
      },
      release_billet: {
        type: Sequelize.INTEGER,
      },
      release_credit_card: {
        type: Sequelize.INTEGER,
      },
      release_pix: {
        type: Sequelize.INTEGER,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    }),

  down: async (queryInterface) =>
    queryInterface.dropTable('sales_settings_default'),
};
