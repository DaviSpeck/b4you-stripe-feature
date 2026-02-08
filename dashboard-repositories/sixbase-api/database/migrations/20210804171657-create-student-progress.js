module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('student_progress', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_student: {
        type: Sequelize.BIGINT,
      },
      id_product: {
        type: Sequelize.BIGINT,
      },
      hours: {
        type: Sequelize.DECIMAL(10, 2),
      },
      finished_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('student_progress');
  },
};
