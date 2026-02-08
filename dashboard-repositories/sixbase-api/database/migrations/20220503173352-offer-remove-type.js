module.exports = {
  up: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('product_offer', 'type')]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('product_offer', 'type', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
    ]);
  },
};
