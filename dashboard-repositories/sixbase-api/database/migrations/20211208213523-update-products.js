module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'checkout_description', {
        type: `${Sequelize.TEXT} CHARSET utf8 COLLATE utf8_unicode_ci`,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'checkout_description', {
        type: Sequelize.TEXT,
      }),
    ]);
  },
};
