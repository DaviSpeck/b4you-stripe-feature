module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'recommend_market_position', {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'recommend_market_position'),
    ]);
  },
};
