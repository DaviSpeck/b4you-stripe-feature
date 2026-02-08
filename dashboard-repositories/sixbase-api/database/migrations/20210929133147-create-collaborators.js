module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('collaborators', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
      },
      id_producer: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_status: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      permissions: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
      accepted_at: Sequelize.DATE,
    }),

  down: async (queryInterface) => queryInterface.dropTable('collaborators'),
};
