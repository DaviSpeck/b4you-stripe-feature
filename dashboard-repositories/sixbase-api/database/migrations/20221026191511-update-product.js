module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'second_header_mobile', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('products', 'second_header_mobile_key', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'second_header_mobile'),
      queryInterface.removeColumn('products', 'second_header_mobile_key'),
    ]);
  },
};
