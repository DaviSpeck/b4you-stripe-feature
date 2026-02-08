module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('questions', 'deleted_at', {
        type: Sequelize.DATE,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('questions', 'deleted_at')]);
  },
};
