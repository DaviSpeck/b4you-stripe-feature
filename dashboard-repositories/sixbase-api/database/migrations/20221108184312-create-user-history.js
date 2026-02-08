module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('user_history', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_type: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      params: {
        type: Sequelize.JSON,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('user_history'),
};
