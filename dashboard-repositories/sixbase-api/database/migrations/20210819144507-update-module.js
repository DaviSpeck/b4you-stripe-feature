module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('modules', 'release', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('modules', 'release');
  },
};
