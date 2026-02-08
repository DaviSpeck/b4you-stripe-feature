module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('classrooms', 'uuid', {
      type: Sequelize.UUID,
      unique: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('classrooms', 'uuid');
  },
};
