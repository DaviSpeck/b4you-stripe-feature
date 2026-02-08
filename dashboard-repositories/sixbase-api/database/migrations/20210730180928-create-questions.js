module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('questions', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
      },
      id_student: {
        type: Sequelize.BIGINT,
      },
      id_user: {
        type: Sequelize.BIGINT,
      },
      id_lesson: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_question: {
        type: Sequelize.BIGINT,
      },
      id_top_question: {
        type: Sequelize.BIGINT,
      },
      title: {
        type: Sequelize.STRING,
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
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('questions');
  },
};
