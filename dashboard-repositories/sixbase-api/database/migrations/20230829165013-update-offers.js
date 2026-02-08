module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('product_offer', 'uuid_offer_back_redirect', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('product_offer', 'uuid_offer_back_redirect'),
    ]);
  },
};
