module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('product_offer', 'quantity', {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('product_offer', 'quantity'),
    ]);
  },
};
