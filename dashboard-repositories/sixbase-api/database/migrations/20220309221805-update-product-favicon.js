module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'favicon', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'favicon_key', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all(
      [queryInterface.removeColumn('products', 'favicon')],
      [queryInterface.removeColumn('products', 'favicon_key')],
    );
  },
};
