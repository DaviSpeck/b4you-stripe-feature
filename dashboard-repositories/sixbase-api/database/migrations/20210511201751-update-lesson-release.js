module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('lessons', 'release', {
      type: Sequelize.INTEGER,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('lessons', 'release');
  },
};
