module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('lessons', 'url_video');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('lessons', 'url_video', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
