module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('modules', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('modules', 'deleted_at');
  },
};
