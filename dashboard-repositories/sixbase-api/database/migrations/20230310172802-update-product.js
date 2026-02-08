module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'id_status_market', {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'id_status_market'),
    ]);
  },
};
