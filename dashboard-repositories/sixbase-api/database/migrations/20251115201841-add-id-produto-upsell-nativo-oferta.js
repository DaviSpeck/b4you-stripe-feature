module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('upsell_native_offer', 'product_id', {
      type: Sequelize.INTEGER,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('upsell_native_offer', 'product_id');
  },
};
