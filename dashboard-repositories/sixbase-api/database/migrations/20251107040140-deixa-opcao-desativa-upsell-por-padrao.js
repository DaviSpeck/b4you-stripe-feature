module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('product_offer', 'is_upsell_active', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('product_offer', 'is_upsell_active', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },
};
