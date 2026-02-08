module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'deleted_at', {
        type: Sequelize.DATE,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('products', 'deleted_at')]);
  },
};
