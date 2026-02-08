module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'id_classroom'),
      queryInterface.removeColumn('products', 'payment_frequency'),
      queryInterface.removeColumn('products', 'annual_discount'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'id_classroom', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'payment_frequency', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'annual_discount', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      }),
    ]);
  },
};
