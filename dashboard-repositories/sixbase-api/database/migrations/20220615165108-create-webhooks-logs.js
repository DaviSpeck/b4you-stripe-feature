module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('webhooks_logs', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_webhook: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      body: {
        type: Sequelize.JSON,
      },
      tries: {
        type: Sequelize.INTEGER,
      },
      success: {
        type: Sequelize.BOOLEAN,
      },
      response_status: {
        type: Sequelize.STRING,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      sent_at: Sequelize.DATE,
    }),

  down: async (queryInterface) => queryInterface.dropTable('webhooks_logs'),
};
