module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('students_classrooms', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_classroom: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_student: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) =>
    queryInterface.dropTable('students_classrooms'),
};
