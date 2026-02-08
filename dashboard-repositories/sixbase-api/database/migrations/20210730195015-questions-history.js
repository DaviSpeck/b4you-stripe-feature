module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('questions_history', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_question: {
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
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('questions_history');
  },
};
