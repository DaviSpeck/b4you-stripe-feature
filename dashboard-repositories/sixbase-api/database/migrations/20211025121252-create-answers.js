module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('answers', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
      },
      id_question: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_user: {
        type: Sequelize.BIGINT,
      },
      id_student: {
        type: Sequelize.BIGINT,
      },
      team_member: {
        type: Sequelize.BIGINT,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('answers'),
};
