module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('product_offer', 'affiliate_visible', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('product_offer', 'affiliate_visible');
  },
};
