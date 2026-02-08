module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('lesson_notes', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
      },
      id_lesson: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_student: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('lesson_notes'),
};
