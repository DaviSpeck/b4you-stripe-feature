module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'second_header', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('products', 'second_header_key', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'second_header'),
      queryInterface.removeColumn('products', 'second_header_key'),
    ]);
  },
};
