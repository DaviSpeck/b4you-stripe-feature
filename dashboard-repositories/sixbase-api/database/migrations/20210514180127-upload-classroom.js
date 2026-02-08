module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('classrooms', 'id_student');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('classrooms', 'id_student', {
      type: Sequelize.BIGINT,
    });
  },
};
