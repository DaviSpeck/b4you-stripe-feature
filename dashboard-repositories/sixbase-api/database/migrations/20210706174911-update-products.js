module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('products', 'price');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });
  },
};
