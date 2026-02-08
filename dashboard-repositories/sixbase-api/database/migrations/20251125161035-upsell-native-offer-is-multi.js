module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('upsell_native_offer', 'is_multi_offer', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('upsell_native_offer', 'is_multi_offer');
  },
};
