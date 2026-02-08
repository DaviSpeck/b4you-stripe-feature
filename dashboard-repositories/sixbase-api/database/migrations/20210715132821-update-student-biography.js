module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('students', 'biography', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('students', 'biography');
  },
};
