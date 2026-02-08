module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('collaborators_activity', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
      },
      id_user_request: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_collaborator: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      route: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      params: {
        type: Sequelize.JSON,
      },
      created_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) =>
    queryInterface.dropTable('collaborators_activity'),
};
