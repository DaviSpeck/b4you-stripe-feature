module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('logs_backoffice', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_user_backoffice: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_user: {
        type: Sequelize.BIGINT,
      },
      id_event: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      params: {
        type: Sequelize.JSON,
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('logs_backoffice'),
};
