module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('user_login_logs', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      ip: {
        type: Sequelize.STRING,
      },
      params: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('user_login_logs'),
};
