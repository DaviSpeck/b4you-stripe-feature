module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('upsell_native_offer', 'creation_origin', {
      type: Sequelize.STRING,
      defaultValue: 'product',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('upsell_native_offer', 'creation_origin');
  },
};
