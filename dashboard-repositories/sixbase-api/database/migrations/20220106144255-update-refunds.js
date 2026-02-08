module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('refunds', 'api_response', {
        type: Sequelize.JSON,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('refunds', 'api_response')]);
  },
};
