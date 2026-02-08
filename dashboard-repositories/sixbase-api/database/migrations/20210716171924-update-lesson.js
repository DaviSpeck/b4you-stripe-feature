module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('lessons', 'has_attachment');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('lessons', 'has_attachment', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
  },
};
