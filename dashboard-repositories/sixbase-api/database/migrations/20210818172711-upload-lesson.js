module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('lessons', 'video_status', {
      type: Sequelize.SMALLINT,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('lessons', 'video_status');
  },
};
